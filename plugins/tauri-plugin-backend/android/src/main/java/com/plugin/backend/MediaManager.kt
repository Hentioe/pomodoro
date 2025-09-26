package com.plugin.backend

import android.content.Context
import android.os.Looper
import android.util.Log
import androidx.media3.common.AudioAttributes
import androidx.media3.common.C
import androidx.media3.common.MediaItem
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.exoplayer.PlayerMessage

// 路径，重叠位置（秒）
enum class LocalMedia(val path: String, val overlapPositionSecs: Float) {
    RAIN("musics/rain.mp3", 36.6f); // 雨声，36.6 秒位置重叠（原淡出位置在 37 秒）

    companion object {
        fun from_setting_key(key: String?): LocalMedia? {
            return when (key) {
                "rain_music" -> RAIN
                else -> null
            }
        }
    }
}

class MediaManager(private val context: Context) {
    companion object {
        const val LOG_TAG = "tauripomodoro:MediaManager"
    }

    enum class Role {
        A,
        B
    }

    data class Payload(val role: Role, val overlapPositionMs: Long)

    private val exoPlayerA: ExoPlayer by lazy { ExoPlayer.Builder(context).build() }

    private val exoPlayerB: ExoPlayer by lazy { ExoPlayer.Builder(context).build() }

    private var isLooping: Boolean = false

    // todo: 重构为 ExoPlayer 的扩展函数
    fun reset_player(player: ExoPlayer, mediaItem: MediaItem, volume: Float?) {
        player.stop()
        player.clearMediaItems()
        player.setAudioAttributes(
            AudioAttributes.Builder()
                .setUsage(C.USAGE_MEDIA) // 设置音频用途为媒体
                .setContentType(C.CONTENT_TYPE_MUSIC) // 设置内容类型为音乐
                .build(),
            false)
        player.setMediaItem(mediaItem)
        player.volume = volume ?: 0.6f
        player.prepare()
    }

    // todo: 重构为 ExoPlayer 的扩展函数
    fun addMessage(role: Role, player: ExoPlayer, position: Long) {
        player
            .createMessage(customTarget)
            .setLooper(Looper.getMainLooper())
            .setPayload(Payload(role, position))
            .setPosition(position)
            .send()
    }

    private val customTarget =
        object : PlayerMessage.Target {
            override fun handleMessage(messageType: Int, payload: Any?) {
                if (payload is Payload && payload.role == Role.A) {
                    Log.i(LOG_TAG, "Switching to Player B")
                    exoPlayerB.seekTo(0)
                    addMessage(Role.B, exoPlayerB, payload.overlapPositionMs)
                    exoPlayerB.play()
                } else if (payload is Payload && payload.role == Role.B) {
                    Log.i(LOG_TAG, "Switching to Player A")
                    exoPlayerA.seekTo(0)
                    addMessage(Role.A, exoPlayerA, payload.overlapPositionMs)
                    exoPlayerA.play()
                }
            }
        }

    fun play(media: LocalMedia, volume: Float?) {
        stop() // 停止可能的播放
        isLooping = true
        val assetUri = "asset:///${media.path}"
        val mediaItem = MediaItem.fromUri(assetUri)
        reset_player(exoPlayerA, mediaItem, volume)
        reset_player(exoPlayerB, mediaItem, volume)
        addMessage(Role.A, exoPlayerA, (media.overlapPositionSecs * 1000).toLong())
        exoPlayerA.play()

        Log.i(LOG_TAG, "Started playing media: $assetUri with volume: ${volume}")
    }

    fun setVolume(volume: Float) {
        exoPlayerA.volume = volume
        exoPlayerB.volume = volume
        Log.i(LOG_TAG, "Set media volume: ${volume}")
    }

    fun isLooping(): Boolean = isLooping

    fun stop() {
        isLooping = false
        if (exoPlayerA.isPlaying) {
            exoPlayerA.stop()
        }
        if (exoPlayerB.isPlaying) {
            exoPlayerB.stop()
        }
    }

    fun release() {
        exoPlayerA.release()
        exoPlayerB.release()
    }
}
