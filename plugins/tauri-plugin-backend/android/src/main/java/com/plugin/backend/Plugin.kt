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

@TauriPlugin
class Plugin(private val activity: Activity) : Plugin(activity), ServiceCallback {
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
    fun play(invoke: Invoke) {
        if (service != null && isServiceRunning()) {
            // 如果 service 不为空，且服务正在运行
            Log.i(LOG_TAG, "Resuming playback")
            service?.startTimer()
        } else {
            Log.i(LOG_TAG, "Starting and binding to service")
            checkPermission()
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
    fun ping(invoke: Invoke) {
        val args = invoke.parseArgs(PingArgs::class.java)

        val ret = JSObject()
        ret.put("value", args.value)
        invoke.resolve(ret)
    }

    @Command
    fun toast(invoke: Invoke) {
        val args = invoke.parseArgs(ToastArgs::class.java)

        Toast.makeText(activity, args.message, Toast.LENGTH_SHORT).show()
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
