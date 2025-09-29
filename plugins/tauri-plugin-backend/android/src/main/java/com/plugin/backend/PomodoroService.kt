package com.plugin.backend

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Binder
import android.os.IBinder
import android.util.Log
import android.widget.RemoteViews
import android.widget.Toast
import androidx.core.app.NotificationCompat
import androidx.datastore.preferences.core.Preferences
import java.lang.ref.WeakReference
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.MainScope
import kotlinx.coroutines.cancel
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

enum class PomodoroPhase(val value: String, val defaultSeconds: Int) {
    FOCUS("focus", 25 * 60), // 25 分钟
    SHORT_BREAK("short_break", 5 * 60), // 5 分钟
    LONG_BREAK("long_break", 15 * 60) // 15 分钟
}

class PomodoroService : Service() {
    companion object {
        const val LOG_TAG = "tauripomodoro:PomodoroService"
        const val ACTION_START_AND_BIND = "ACTION_START_AND_BIND"
        const val ACTION_PRE_START = "ACTION_PRE_START"
        const val ACTION_TOGGLE = "ACTION_TOGGLE"
        const val ACTION_CLOSE = "ACTION_CLOSE"
    }

    val soundManager = SoundManager(this) // 声音管理器（封装短音频）
    val alarmManager = AlarmManager(this) // 闹钟管理器（封装提示音）
    val mediaManager = MediaManager(this) // 媒体管理器（封装长音频）
    private var settings =
        Settings(
            tickSound = "default_tick",
            backgroundMusic = "none",
            tickVolume = 0.5f,
            alarmVolume = 0.8f,
            promptVolume = 0.8f,
            backgroundVolume = 0.6f,
            focusMinutes = 25,
            shortBreakMinutes = 5,
            longBreakMinutes = 15) // 默认设置
    private val binder = LocalBinder()
    private var callback: WeakReference<ServiceCallback>? = null // 使用弱引用持有回调
    private var settingsCallback: WeakReference<SettingsCallback>? = null // 使用弱引用持有设置回调
    private val NOTIFICATION_ID = 1
    private val CHANNEL_ID = "PomodoroChannel"
    private var toast: Toast? = null
    private val scope = MainScope()
    private var timerJob: Job? = null // 暴露 Job 以便取消
    private var isTimerRunning = false
    private var state =
        PomodoroState(
            phase = PomodoroPhase.FOCUS,
            remainingSeconds = PomodoroPhase.FOCUS.defaultSeconds,
            isPlaying = false,
            cycleCount = 0) // 默认状态
    private var toggleIcon =
        if (state.isPlaying) R.drawable.ic_pause else R.drawable.ic_play // 默认图标

    inner class LocalBinder : Binder() {
        fun getService(): PomodoroService = this@PomodoroService
    }

    override fun onBind(intent: Intent?): IBinder = binder

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        // 初始化短音频
        soundManager.initialize()
        // 初始化闹钟音频
        alarmManager.initialize()
        // 载入并推送设置
        loadPushSettings()
        // 应用配置中的剩余时间
        state.remainingSeconds = currentTotalSeconds()
        Log.d(LOG_TAG, "Loaded settings: $settings")
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d(LOG_TAG, "Received intent: ${intent?.action}")

        when (intent?.action) {
            ACTION_TOGGLE -> {
                // 切换播放状态
                Log.i(LOG_TAG, "Icon clicked! Perform your action here")
                if (state.isPlaying) {
                    stopTimer()
                } else {
                    startTimer()
                }
                updateNotification()
            }
            ACTION_CLOSE -> {
                // 关闭服务
                Log.i(LOG_TAG, "Close action received. Stopping service")
                stopTimer()
                // 将 state 恢复到最初的状态
                state =
                    PomodoroState(
                        phase = PomodoroPhase.FOCUS,
                        remainingSeconds = settings.focusMinutes * 60,
                        isPlaying = false,
                        cycleCount = 0)
                updatePomodoroState() // 更新状态
                // 停止服务
                stopSelf()
            }
            ACTION_START_AND_BIND -> {
                // 启动和绑定服务
                startForeground(
                    NOTIFICATION_ID,
                    buildNotification(),
                    ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE)
                startTimer() // 启动计时器
            }
            ACTION_PRE_START -> {
                // 预先启动服务
                startForeground(
                    NOTIFICATION_ID,
                    buildNotification(),
                    ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE)
            }
        }

        return START_NOT_STICKY
    }

    fun startTimer() {
        if (isTimerRunning) return // 避免重复启动
        isTimerRunning = true
        state.isPlaying = true
        toggleIcon = R.drawable.ic_pause // 暂停图标
        timerJob =
            scope.launch {
                while (true) {
                    if (state.remainingSeconds > 0 && isTimerRunning) {
                        state.isPlaying = true
                        updatePomodoroState() // 更新状态
                        updateNotification() // 更新通知
                        delay(1000L) // 延迟 1 秒
                        state.remainingSeconds -= 1 // 减少剩余时间
                        // 播放滴答声
                        val soundType = SoundType.from_setting_key(settings.tickSound)
                        if (soundType != null && settings.tickVolume > 0f) {
                            soundManager.play(soundType, settings.tickVolume)
                        }
                        if (state.phase == PomodoroPhase.FOCUS && // 专注阶段
                            settings.backgroundVolume > 0f && // 背景未静音
                            mediaManager.isLooping().not() // 背景未播放
                        ) {
                            // 符合背景播放条件，检索设置的音乐并尝试播放
                            val localMedia = LocalMedia.from_setting_key(settings.backgroundMusic)
                            if (localMedia != null) {
                                Log.i(LOG_TAG, "Starting background media for focus phase")
                                mediaManager.play(
                                    localMedia, settings.backgroundVolume) // 音量也从配置中读取
                            }
                        }
                    } else if (state.isPlaying) {
                        // 如果正在播放，说明是阶段计时结束
                        Log.d(LOG_TAG, "Phase: ${state.phase.value} ended")
                        updateNotification() // 更新通知（因为下一次更新已不在循环中）
                        // 进入下一个阶段
                        nextPhase() // 更新阶段和周期次数
                        Log.d(LOG_TAG, "Switched to phase: ${state.phase.value}")
                        if (state.phase != PomodoroPhase.FOCUS) {
                            // 如果当前已不是专注阶段，则停止背景音
                            Log.i(LOG_TAG, "Stopping background media as phase is not focus")
                            mediaManager.stop()
                        }
                        updatePomodoroState() // 更新状态
                        // 播放结束铃声
                        alarmManager.play(AlarmSound.ALARM, settings.alarmVolume)
                        delay((AlarmSound.ALARM.durationSeconds * 1000).toLong()) // 延迟播放时间
                        // 下一阶段提示
                        phaseAlert()
                        // 重置剩余时间，再次进入循环
                        state.remainingSeconds = currentTotalSeconds()
                        updatePomodoroState() // 更新状态
                    } else {
                        // 被取消
                        state.isPlaying = false
                        isTimerRunning = false
                        Log.i(LOG_TAG, "Stopping background media as timer is stopped")
                        mediaManager.stop() // 停止背景音
                        updatePomodoroState() // 更新状态
                        break
                    }
                }
            }
    }

    fun stopTimer() {
        timerJob?.cancel() // 立即取消协程
        isTimerRunning = false
        state.isPlaying = false
        mediaManager.stop() // 停止背景音
        toggleIcon = R.drawable.ic_play // 播放图标
        updatePomodoroState() // 更新状态
        updateNotification() // 更新通知
    }

    fun resetTimer() {
        state.remainingSeconds = currentTotalSeconds()
        updatePomodoroState() // 更新状态
        updateNotification() // 更新通知
    }

    fun skipToNextPhase() {
        if (isTimerRunning) {
            stopTimer()
        }
        scope.launch(Dispatchers.Main) {
            Log.d(LOG_TAG, "Skipping to next phase from ${state.phase.value}")

            nextPhase()
            state.remainingSeconds = currentTotalSeconds()
            updatePomodoroState() // 更新状态
            updateNotification() // 更新通知
            phaseAlert() // 阶段提示
            startTimer() // 重新开始计时器
        }
        Log.d(LOG_TAG, "Skipped to phase: ${state.phase.value}")
    }

    private fun nextPhase() {
        when (state.phase) {
            PomodoroPhase.FOCUS -> {
                if (state.cycleCount == 3) {
                    // 如果周期次数达到 3，进入长休息
                    state.phase = PomodoroPhase.LONG_BREAK
                } else {
                    // 否则进入短休息
                    state.phase = PomodoroPhase.SHORT_BREAK
                }
            }
            PomodoroPhase.SHORT_BREAK -> {
                // 完成一个番茄周期
                state.cycleCount += 1
                state.phase = PomodoroPhase.FOCUS
            }
            PomodoroPhase.LONG_BREAK -> {
                state.cycleCount = 0 // 重置周期计数
                state.phase = PomodoroPhase.FOCUS
            }
        }
    }

    // 阶段提示
    private suspend fun phaseAlert() {
        when (state.phase) {
            PomodoroPhase.FOCUS -> {
                showToast("要开始专注了~")
                alarmManager.play(AlarmSound.FOCUS_ALERT, settings.promptVolume)
                delay((AlarmSound.FOCUS_ALERT.durationSeconds * 1000).toLong())
            }
            PomodoroPhase.SHORT_BREAK -> {
                showToast("休息一下吧~")
                alarmManager.play(AlarmSound.SHORT_BREAK_ALERT, settings.promptVolume)
                delay((AlarmSound.SHORT_BREAK_ALERT.durationSeconds * 1000).toLong())
            }
            PomodoroPhase.LONG_BREAK -> {
                showToast("多休息一下，放松放松自己~")
                alarmManager.play(AlarmSound.LONG_BREAK_ALERT, settings.promptVolume)
                delay((AlarmSound.LONG_BREAK_ALERT.durationSeconds * 1000).toLong())
            }
        }
    }

    override fun onDestroy() {
        Log.d(LOG_TAG, "Service destroyed")
        super.onDestroy()
        // 取消回调注册
        unregisterCallback()
        unregisterSettingsCallback()
        // 释放资源
        soundManager.release() // 释放短音频资源
        alarmManager.release() // 释放提示音资源
        mediaManager.release() // 释放长音频资源
        scope.cancel() // 取消所有协程
    }

    fun loadPushSettings() {
        val tickSound = readSetting<String>(SettingsKey.TICK_SOUND)
        val backgroundMusic = readSetting<String>(SettingsKey.BACKGROUND_MUSIC)
        val tickVolume = readSetting<Float>(SettingsKey.TICK_VOLUME)
        val alarmVolume = readSetting<Float>(SettingsKey.ALARM_VOLUME)
        val promptVolume = readSetting<Float>(SettingsKey.PROMPT_VOLUME)
        val backgroundVolume = readSetting<Float>(SettingsKey.BACKGROUND_VOLUME)
        val focusMinutes = readSetting<Int>(SettingsKey.FOCUS_MINUTES)
        val shortBreakMinutes = readSetting<Int>(SettingsKey.SHORT_BREAK_MINUTES)
        val longBreakMinutes = readSetting<Int>(SettingsKey.LONG_BREAK_MINUTES)
        if (tickSound != null) {
            settings.tickSound = tickSound
        }
        if (backgroundMusic != null) {
            settings.backgroundMusic = backgroundMusic
        }
        if (tickVolume != null) {
            settings.tickVolume = tickVolume
        }
        if (alarmVolume != null) {
            settings.alarmVolume = alarmVolume
        }
        if (promptVolume != null) {
            settings.promptVolume = promptVolume
        }
        if (backgroundVolume != null) {
            settings.backgroundVolume = backgroundVolume
        }
        if (focusMinutes != null) {
            settings.focusMinutes = focusMinutes
        }
        if (shortBreakMinutes != null) {
            settings.shortBreakMinutes = shortBreakMinutes
        }
        if (longBreakMinutes != null) {
            settings.longBreakMinutes = longBreakMinutes
        }
        updateSettings() // 推送设置
    }

    // 注册回调
    fun registerCallback(callback: ServiceCallback) {
        this.callback = WeakReference(callback)
    }

    // 取消回调
    fun unregisterCallback() {
        this.callback = null
    }

    fun registerSettingsCallback(callback: SettingsCallback) {
        this.settingsCallback = WeakReference(callback)
        // 立即推送当前设置
        updateSettings()
    }

    fun unregisterSettingsCallback() {
        this.settingsCallback = null
    }

    private fun showToast(message: String, duration: Int = Toast.LENGTH_SHORT) {
        toast?.cancel() // 取消之前的 Toast
        toast = Toast.makeText(this, message, duration)
        toast?.show()
    }

    private fun buildNotification(): Notification {
        // 应用主界面 Intent
        val intent = packageManager.getLaunchIntentForPackage(packageName)
        val pendingIntent =
            PendingIntent.getActivity(
                this, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_MUTABLE)
        // 创建 RemoteViews（自定义 UI）
        val notificationLayout = RemoteViews(packageName, R.layout.custom_notification)
        val notificationLayoutExpanded = RemoteViews(packageName, R.layout.custom_notification)
        // 生成时间文本
        val timeFormatted = secondsToTimeFormat(state.remainingSeconds.toLong())
        val phaseColorRes =
            when (state.phase) {
                PomodoroPhase.FOCUS -> R.color.focus
                PomodoroPhase.SHORT_BREAK -> R.color.short_break
                PomodoroPhase.LONG_BREAK -> R.color.long_break
            }
        // 生成时间颜色
        val phaseColor = resources.getColor(phaseColorRes, theme)
        // 设置文本和颜色
        notificationLayout.setTextViewText(R.id.notification_time, timeFormatted)
        notificationLayoutExpanded.setTextViewText(R.id.notification_time, timeFormatted)
        notificationLayout.setTextColor(R.id.notification_time, phaseColor)
        notificationLayoutExpanded.setTextColor(R.id.notification_time, phaseColor)
        // 设置图标
        notificationLayout.setImageViewResource(R.id.notification_toggle, toggleIcon)
        notificationLayoutExpanded.setImageViewResource(R.id.notification_toggle, toggleIcon)
        if (state.isPlaying) {
            // 如果状态是播放，则不显示 close 图标
            notificationLayout.setViewVisibility(R.id.notification_close, 8) // GONE
            notificationLayoutExpanded.setViewVisibility(R.id.notification_close, 8) // GONE
        } else {
            // 如果状态是暂停，则显示 close 图标
            notificationLayout.setViewVisibility(R.id.notification_close, 1) // VISIBLE
            notificationLayoutExpanded.setViewVisibility(R.id.notification_close, 1) // VISIBLE
        }
        // 创建切换图标的点击事件
        val toggleIntent = Intent(this, this::class.java).apply { action = ACTION_TOGGLE }
        val togglePendingIntent =
            PendingIntent.getService(
                this,
                0, // requestCode，需唯一或随通知变化
                toggleIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        notificationLayout.setOnClickPendingIntent(R.id.notification_toggle, togglePendingIntent)
        notificationLayoutExpanded.setOnClickPendingIntent(
            R.id.notification_toggle, togglePendingIntent)
        // 创建关闭服务的点击事件
        val closeIntent = Intent(this, this::class.java).apply { action = ACTION_CLOSE }
        val closePendingIntent =
            PendingIntent.getService(
                this,
                0, // requestCode，需唯一或随通知变化
                closeIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        notificationLayout.setOnClickPendingIntent(R.id.notification_close, closePendingIntent)
        notificationLayoutExpanded.setOnClickPendingIntent(
            R.id.notification_close, closePendingIntent)

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setCustomContentView(notificationLayout) // 自定义视图
            .setCustomBigContentView(notificationLayoutExpanded) // 自定义展开视图
            .setSmallIcon(R.drawable.ic_notification)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT) // 默认优先级
            .setContentIntent(pendingIntent) // 打开应用主界面
            .setShowWhen(false) // 不显示时间戳
            .setOnlyAlertOnce(true) // 避免影响屏幕熄灭
            .build()
    }

    private fun secondsToTimeFormat(seconds: Long): String {
        val duration = java.time.Duration.ofSeconds(seconds)
        val minutes = duration.toMinutesPart()
        val secs = duration.toSecondsPart()
        return String.format("%02d:%02d", minutes, secs)
    }

    private fun updateNotification() {
        val notification = buildNotification()
        val manager = getSystemService(NotificationManager::class.java)
        manager.notify(NOTIFICATION_ID, notification)
    }

    private fun createNotificationChannel() {
        val channel =
            NotificationChannel(
                CHANNEL_ID, "Pomodoro Timer", NotificationManager.IMPORTANCE_DEFAULT)
        channel.setShowBadge(false) // 不显示角标
        channel.setSound(null, null) // 不播放声音
        channel.setVibrationPattern(longArrayOf(0)) // 不震动
        val manager = getSystemService(NotificationManager::class.java)
        manager.createNotificationChannel(channel)
    }

    fun currentTotalSeconds(): Int {
        return when (state.phase) {
            PomodoroPhase.FOCUS -> settings.focusMinutes * 60
            PomodoroPhase.SHORT_BREAK -> settings.shortBreakMinutes * 60
            PomodoroPhase.LONG_BREAK -> settings.longBreakMinutes * 60
        }
    }

    fun state(): PomodoroState = state

    fun settings(): Settings = settings

    fun <T> writeSetting(key: SettingsKey, value: T): Boolean {
        this.settingsStore.writeSync(key.createKey() as Preferences.Key<T>, value)
        // 重新载入并推送设置
        loadPushSettings()
        // 处理可能涉及音乐的修改
        maybeWriteMusicSetting(key, value as Any)
        // 处理可能涉及音量的修改
        maybeWriteVolumeSetting(key, value as Any)
        // 处理可能涉及时长的修改
        maybeWriteDurationSetting(key)

        return true
    }

    fun maybeWriteMusicSetting(key: SettingsKey, value: Any) {
        when (key) {
            SettingsKey.BACKGROUND_MUSIC -> {
                val localMedia = LocalMedia.from_setting_key(value as String)
                if (localMedia == null) {
                    Log.i(LOG_TAG, "Background music set to none or invalid, stopping playback")
                    // 如果设置为 none，则停止播放
                    mediaManager.stop()
                } else if (settings.backgroundVolume >= 0f &&
                    state.phase == PomodoroPhase.FOCUS &&
                    state.isPlaying) {
                    Log.i(LOG_TAG, "Applying new background music setting immediately")
                    // 符合即时生效条件，立即切换音乐
                    mediaManager.play(localMedia, settings.backgroundVolume)
                }
            }
            else -> {}
        }
    }

    fun maybeWriteVolumeSetting(key: SettingsKey, value: Any) {
        when (key) {
            SettingsKey.BACKGROUND_VOLUME -> {
                if (mediaManager.isLooping()) {
                    // 符合即时生效条件，立即调整音量
                    mediaManager.setVolume(value as Float)
                }
            }
            else -> {}
        }
    }

    fun maybeWriteDurationSetting(key: SettingsKey) {
        when (key) {
            SettingsKey.FOCUS_MINUTES,
            SettingsKey.SHORT_BREAK_MINUTES,
            SettingsKey.LONG_BREAK_MINUTES -> {
                if (state.phase ==
                    when (key) {
                        SettingsKey.FOCUS_MINUTES -> PomodoroPhase.FOCUS
                        SettingsKey.SHORT_BREAK_MINUTES -> PomodoroPhase.SHORT_BREAK
                        SettingsKey.LONG_BREAK_MINUTES -> PomodoroPhase.LONG_BREAK
                        else -> null
                    }) {
                    // 符合即时生效条件，立即更新时长
                    state.remainingSeconds = currentTotalSeconds() // 重置定时器时间
                    updateNotification() // 更新通知
                }
            }
            else -> {}
        }
    }

    fun <T> readSetting(key: SettingsKey): T? {
        return this.settingsStore.readSync(key.createKey() as Preferences.Key<T>)
    }

    private fun updatePomodoroState() {
        callback?.get()?.onPomodoroStateUpdated(state)
    }

    private fun updateSettings() {
        settingsCallback?.get()?.onSettingsUpdated(settings)
    }
}
