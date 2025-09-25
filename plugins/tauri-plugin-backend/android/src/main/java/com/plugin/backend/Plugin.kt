package com.plugin.backend

import android.app.Activity
import android.app.ActivityManager
import android.app.Application.ActivityLifecycleCallbacks
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.ServiceConnection
import android.os.Bundle
import android.os.IBinder
import android.util.Log
import android.webkit.WebView
import android.widget.Toast
import app.tauri.annotation.Command
import app.tauri.annotation.InvokeArg
import app.tauri.annotation.TauriPlugin
import app.tauri.plugin.Invoke
import app.tauri.plugin.JSObject
import app.tauri.plugin.Plugin

@InvokeArg
class PingArgs {
    var value: String = "pong"
}

@InvokeArg
class ToastArgs {
    var message: String = ""
}

@InvokeArg
class previewSoundArgs {
    var name: String = ""
    var volume: Float? = null
}

@InvokeArg
class WriteSettingsArgs {
    var tickSound: String? = null
    var tickVolume: Float? = null
    var alarmVolume: Float? = null
    var promptVolume: Float? = null
    var backgroundVolume: Float? = null
    var focusMinutes: Int? = null
    var shortBreakMinutes: Int? = null
    var longBreakMinutes: Int? = null
}

@TauriPlugin
class Plugin(private val activity: Activity) : Plugin(activity), ServiceCallback, SettingsCallback {
    private var service: PomodoroService? = null
    private var isBound = false

    companion object {
        const val LOG_TAG = "tauripomodoro:Plugin"
    }

    override fun load(webView: WebView) {
        super.load(webView)
        Log.i(LOG_TAG, "Plugin loaded")
        // 预启动并绑定服务
        startAndBindService(PomodoroService.ACTION_PRE_START)
    }

    private val connection =
        object : ServiceConnection {
            override fun onServiceConnected(name: ComponentName?, service: IBinder?) {
                Log.i(LOG_TAG, "Service connected")
                val binder = service as PomodoroService.LocalBinder
                this@Plugin.service = binder.getService()
                this@Plugin.service?.registerCallback(this@Plugin)
                this@Plugin.service?.registerSettingsCallback(this@Plugin)
                isBound = true
            }

            override fun onServiceDisconnected(name: ComponentName?) {
                Log.i(LOG_TAG, "Service disconnected")
                isBound = false
                service = null
            }
        }

    init {
        activity.application.registerActivityLifecycleCallbacks(
            object : ActivityLifecycleCallbacks {
                override fun onActivityStarted(activity: Activity) {
                    Log.d(LOG_TAG, "onActivityStarted")
                    if (!isBound && isServiceRunning()) {
                        Log.i(LOG_TAG, "Binding to running service")
                        val intent = Intent(activity, PomodoroService::class.java)
                        bindService(intent)
                    }
                }

                override fun onActivityStopped(activity: Activity) {
                    Log.d(LOG_TAG, "onActivityStopped")
                    if (isBound && isServiceRunning()) {
                        Log.i(LOG_TAG, "Unbinding from service")
                        unbindService()
                    }
                }

                override fun onActivityResumed(activity: Activity) {
                    Log.d(LOG_TAG, "onActivityResumed")
                    val state = service?.state()
                    if (state != null) {
                        Log.i(LOG_TAG, "Pushing current state to frontend")
                        onPomodoroStateUpdated(state)
                    }
                }

                override fun onActivityDestroyed(activity: Activity) {
                    Log.d(LOG_TAG, "onActivityDestroyed")
                    // 停止服务
                    val intent = Intent(activity, PomodoroService::class.java)
                    activity.stopService(intent)
                    System.exit(0) // 确保应用完全退出
                }

                // 实现所有必要的方法（即使为空）
                override fun onActivityCreated(activity: Activity, savedInstanceState: Bundle?) {}

                override fun onActivityPaused(activity: Activity) {}

                override fun onActivitySaveInstanceState(activity: Activity, outState: Bundle) {}
            })
    }

    private fun isServiceRunning(): Boolean {
        val manager = activity.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
        val services = manager.getRunningServices(Integer.MAX_VALUE)
        return services.any { it.service.className == PomodoroService::class.java.name }
    }

    private fun bindService(intent: Intent) {
        activity.bindService(intent, connection, 0)
    }

    private fun startAndBindService(action: String = PomodoroService.ACTION_START_AND_BIND) {
        val intent = Intent(activity, PomodoroService::class.java)
        intent.action = action
        bindService(intent)
        activity.startForegroundService(intent) // 确保服务启动
    }

    private fun unbindService() {
        if (isBound) {
            service?.unregisterCallback()
            activity.unbindService(connection)
            isBound = false
        }
    }

    override fun onPomodoroStateUpdated(state: PomodoroState) {
        val event = JSObject()
        event.put("phase", state.phase.value)
        event.put("remainingSeconds", state.remainingSeconds)
        event.put("isPlaying", state.isPlaying)
        event.put("cycleCount", state.cycleCount)
        trigger("pomodoro_updated", event)

        Log.d(LOG_TAG, "Pomodoro state pushed: $state")
    }

    override fun onSettingsUpdated(settings: Settings) {
        val event = JSObject()
        event.put("tickSound", settings.tickSound)
        event.put("tickVolume", settings.tickVolume)
        event.put("alarmVolume", settings.alarmVolume)
        event.put("promptVolume", settings.promptVolume)
        event.put("backgroundVolume", settings.backgroundVolume)
        event.put("focusMinutes", settings.focusMinutes)
        event.put("shortBreakMinutes", settings.shortBreakMinutes)
        event.put("longBreakMinutes", settings.longBreakMinutes)
        trigger("settings_updated", event)

        Log.d(LOG_TAG, "Settings pushed: $settings")
    }

    private fun checkPermission() {
        if (android.os.Build.VERSION.SDK_INT >=
            android.os.Build.VERSION_CODES.TIRAMISU) { // Android 13+
            val permission = android.Manifest.permission.POST_NOTIFICATIONS
            val res = activity.checkSelfPermission(permission)
            val shouldShowRationale = activity.shouldShowRequestPermissionRationale(permission)
            if (res != android.content.pm.PackageManager.PERMISSION_GRANTED &&
                !shouldShowRationale) {
                Toast.makeText(activity, "授予通知权限以显示定时器", Toast.LENGTH_LONG).show()
                activity.requestPermissions(arrayOf(permission), 1)
            }
        }
    }

    @Command
    fun ping(invoke: Invoke) {
        val args = invoke.parseArgs(PingArgs::class.java)

        when (args.value) {
            "--push=settings" -> {
                // 一些需要读取设置的组件挂载完成，推送当前设置
                val settings = service?.settings()
                if (settings != null) {
                    onSettingsUpdated(settings)
                }
            }
            "--push=state" -> {
                // 推送当前状态
                val state = service?.state()
                if (state != null) {
                    onPomodoroStateUpdated(state)
                }
            }
        }

        val ret = JSObject()
        ret.put("pong", args.value)
        invoke.resolve(ret)
    }

    @Command
    fun toast(invoke: Invoke) {
        val args = invoke.parseArgs(ToastArgs::class.java)

        Toast.makeText(activity, args.message, Toast.LENGTH_SHORT).show()
        invoke.resolve()
    }

    @Command
    fun play(invoke: Invoke) {
        checkPermission()
        if (service != null && isServiceRunning()) {
            // 如果 service 不为空，且服务正在运行
            Log.i(LOG_TAG, "Resuming playback")
            service?.startTimer()
        } else {
            Log.i(LOG_TAG, "Starting and binding to service")
            // 启动并绑定服务
            startAndBindService()
        }

        invoke.resolve()
    }

    @Command
    fun pause(invoke: Invoke) {
        Log.i(LOG_TAG, "Pausing playback")
        service?.stopTimer()

        invoke.resolve()
    }

    @Command
    fun reset(invoke: Invoke) {
        Log.i(LOG_TAG, "Resetting playback")
        service?.resetTimer()

        invoke.resolve()
    }

    @Command
    fun next(invoke: Invoke) {
        Log.i(LOG_TAG, "Skipping to next phase")
        service?.skipToNextPhase()

        invoke.resolve()
    }

    @Command
    fun previewSound(invoke: Invoke) {
        Log.i(LOG_TAG, "Previewing sound")
        val args = invoke.parseArgs(previewSoundArgs::class.java)
        val soundType: SoundType? =
            when (args.name) {
                "default_tick",
                "tick-tock_tick",
                "mokugyo_tick",
                "heartbeat_tick",
                "ekg_tick" -> SoundType.from_setting_key(args.name)
                "tick_default" -> SoundType.from_setting_key(service?.settings()?.tickSound)
                "alarm_default" -> SoundType.ALARM
                "prompt_default" -> SoundType.FOCUS_ALERT
                else -> null
            }

        if (soundType != null) {
            service?.soundManager?.play(soundType, args.volume ?: 1f)
            Log.i(LOG_TAG, "Previewing sound: ${args.name}")
        }

        invoke.resolve()
    }

    @Command
    fun writeSettings(invoke: Invoke) {
        Log.i(LOG_TAG, "Writing settings")
        val args = invoke.parseArgs(WriteSettingsArgs::class.java)
        if (args.tickSound != null) {
            service?.writeSetting(SettingsKey.TICK_SOUND, args.tickSound)
            Log.i(LOG_TAG, "Tick sound set to: ${args.tickSound}")
        }
        if (args.tickVolume != null) {
            service?.writeSetting(SettingsKey.TICK_VOLUME, args.tickVolume)
            Log.i(LOG_TAG, "Tick volume set to: ${args.tickVolume}")
        }
        if (args.alarmVolume != null) {
            service?.writeSetting(SettingsKey.ALARM_VOLUME, args.alarmVolume)
            Log.i(LOG_TAG, "Alarm volume set to: ${args.alarmVolume}")
        }
        if (args.promptVolume != null) {
            service?.writeSetting(SettingsKey.PROMPT_VOLUME, args.promptVolume)
            Log.i(LOG_TAG, "Prompt volume set to: ${args.promptVolume}")
        }
        if (args.backgroundVolume != null) {
            service?.writeSetting(SettingsKey.BACKGROUND_VOLUME, args.backgroundVolume)
            Log.i(LOG_TAG, "Background volume set to: ${args.backgroundVolume}")
        }
        if (args.focusMinutes != null) {
            service?.writeSetting(SettingsKey.FOCUS_MINUTES, args.focusMinutes)
            Log.i(LOG_TAG, "Focus minutes set to: ${args.focusMinutes}")
        }
        if (args.shortBreakMinutes != null) {
            service?.writeSetting(SettingsKey.SHORT_BREAK_MINUTES, args.shortBreakMinutes)
            Log.i(LOG_TAG, "Short break minutes set to: ${args.shortBreakMinutes}")
        }
        if (args.longBreakMinutes != null) {
            service?.writeSetting(SettingsKey.LONG_BREAK_MINUTES, args.longBreakMinutes)
            Log.i(LOG_TAG, "Long break minutes set to: ${args.longBreakMinutes}")
        }

        invoke.resolve()
    }

    @Command
    fun exit(invoke: Invoke) {
        Log.i(LOG_TAG, "Exiting application")
        // 停止服务
        val intent = Intent(activity, PomodoroService::class.java)
        activity.stopService(intent)
        activity.finishAffinity() // 关闭所有活动
        invoke.resolve()
    }
}
