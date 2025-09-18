package com.plugin.backend

import android.content.Context
import android.media.AudioAttributes
import android.media.SoundPool

// 音频类型枚举
enum class SoundType(val path: String, val durationSeconds: Float, val defaultVolume: Float) {
    TICK("sounds/tick.wav", 0.0f, 0.5f),
    TICK_TENSION("sounds/ticks/tension.wav", 0.0f, 0.5f),
    TICK_VINTAGE("sounds/ticks/vintage.wav", 0.0f, 0.5f),
    ALARM("sounds/alarm.wav", 3.5f, 0.8f),
    LONG_BREAK_ALERT("sounds/alerts/fixed_long_break.wav", 2.0f, 0.8f),
    SHORT_BREAK_ALERT("sounds/alerts/fixed_short_break.wav", 2.0f, 0.8f),
    FOCUS_ALERT("sounds/alerts/fixed_focus.wav", 2.0f, 0.8f)
}

// 音频数据类
data class SoundResource(
    val type: SoundType,
    var soundId: Int = 0 // 加载后赋值
)

// SoundPool 管理器
class SoundManager(private val context: Context) {
    private var soundPool: SoundPool? = null
    private val sounds = mutableMapOf<SoundType, SoundResource>()
    private var isLoaded = false

    // 初始化：创建 SoundPool 并加载所有音频
    fun initialize() {
        val audioAttributes =
            AudioAttributes.Builder()
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .setUsage(AudioAttributes.USAGE_GAME) // 用于游戏以避免被震动模式静音
                .build()

        soundPool =
            SoundPool.Builder()
                .setMaxStreams(1) // 根据需求调整最大同时流数
                .setAudioAttributes(audioAttributes)
                .build()

        // 加载所有音频
        SoundType.values().forEach { type ->
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
    fun play(type: SoundType, volume: Float? = null) {
        if (!isLoaded) {
            // 可选：日志或延迟播放
            return
        }
        val resource = sounds[type] ?: return
        val volume = volume ?: resource.type.defaultVolume
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
