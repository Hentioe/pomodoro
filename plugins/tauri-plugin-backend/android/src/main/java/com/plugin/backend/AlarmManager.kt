package com.plugin.backend

import android.content.Context
import android.media.AudioAttributes
import android.media.SoundPool

// 声音枚举
enum class AlarmSound(val path: String, val durationSeconds: Float) {
    ALARM("sounds/alarm.wav", 3.5f),
    LONG_BREAK_ALERT("sounds/alerts/fixed_long_break.wav", 2.0f),
    SHORT_BREAK_ALERT("sounds/alerts/fixed_short_break.wav", 2.0f),
    FOCUS_ALERT("sounds/alerts/fixed_focus.wav", 2.0f)
}

// SoundPool 管理器
class AlarmManager(private val context: Context) {
    // 音频数据类
    data class SoundResource(
        val type: AlarmSound,
        var soundId: Int = 0 // 加载后赋值
    )

    private var soundPool: SoundPool? = null
    private val sounds = mutableMapOf<AlarmSound, SoundResource>()
    private var isLoaded = false

    // 初始化：创建 SoundPool 并加载所有音频
    fun initialize() {
        val audioAttributes =
            AudioAttributes.Builder()
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .setUsage(AudioAttributes.USAGE_ALARM) // 用于闹钟，避免受到媒体音量的限制
                .build()

        soundPool =
            SoundPool.Builder()
                .setMaxStreams(1) // 根据需求调整最大同时流数
                .setAudioAttributes(audioAttributes)
                .build()

        // 加载所有音频
        AlarmSound.values().forEach { type ->
            val resource = SoundResource(type)
            sounds[type] = resource
            val descriptor = context.assets.openFd(type.path)
            resource.soundId = soundPool?.load(descriptor, 1) ?: 0 // 优先级1
            descriptor.close() // 及时关闭文件描述符
        }

        // 监听加载完成（异步）
        soundPool?.setOnLoadCompleteListener { _, sampleId, status ->
            if (status == 0) { // 加载成功
                isLoaded = true
                // 可选：在这里回调或日志
            }
        }
    }

    // 播放指定音频（默认使用该音频的音量）
    fun play(type: AlarmSound, volume: Float) {
        if (!isLoaded) {
            // 可选：日志或延迟播放
            return
        }
        val resource = sounds[type] ?: return
        soundPool?.play(resource.soundId, volume, volume, 1, 0, 1.0f)
    }

    // 停止所有播放
    fun stopAll() {
        soundPool?.autoPause() // 暂停所有流
    }

    // 释放资源（在 onDestroy 中调用）
    fun release() {
        soundPool?.apply {
            autoPause()
            release()
        }
        soundPool = null
        isLoaded = false
    }
}
