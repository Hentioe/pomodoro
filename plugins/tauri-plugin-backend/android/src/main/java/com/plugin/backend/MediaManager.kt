package com.plugin.backend

import android.content.Context
import android.os.Looper
import android.util.Log
import androidx.media3.common.AudioAttributes
import androidx.media3.common.C
import androidx.media3.common.MediaItem
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.exoplayer.PlayerMessage

enum class LocalMedia(
    val path: String, // 文件路径
    val overlapPositionSecs: Float, // 重叠位置（秒）
    val delayMs: Int = 200, // 经初步测试，目前的双实例交叉实现大概有接近 0.2 秒的延迟
    val loopable: Boolean = false // 是否是可循环音频
) {

    TIMER("musics/timer.ogg", 0.0f, 0, true), // 计时器，直接循环
    RAIN("musics/rain.ogg", 66f, 400), // 雨声，66 秒位置重叠（由于音频预处理不够，需增加延迟至 0.4 秒）
    WIND_STRONG("musics/wind-strong.mp3", 27f), // 强风，27 秒位置重叠
    BONFIRE("musics/bonfire.ogg", 49f), // 篝火，49 秒位置重叠
    BEACH("musics/beach.mp3", 67f), // 海滩，67 秒位置重叠
    NATURE_STREAM("musics/nature-stream.mp3", 29f), // 自然（溪流），29 秒位置重叠
    NATURE_CRICKETS("musics/nature-crickets.mp3", 40f); // 自然（虫鸣），40 秒位置重叠

    companion object {
        fun from_setting_key(key: String?): LocalMedia? {
            return when (key) {
                "timer_music" -> TIMER
                "rain_music" -> RAIN
                "wind-strong_music" -> WIND_STRONG
                "beach_music" -> BEACH
                "bonfire_music" -> BONFIRE
                "nature-stream_music" -> NATURE_STREAM
                "nature-crickets_music" -> NATURE_CRICKETS
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

    val listener =
        object : Player.Listener {
            override fun onEvents(player: Player, events: Player.Events) {
                if (events.contains(Player.EVENT_PLAYBACK_STATE_CHANGED) &&
                    player.playbackState == Player.STATE_READY) {
                    Log.d(LOG_TAG, "Player is ready and started playing")
                }
            }
        }

    private val exoPlayerA: ExoPlayer by lazy {
        ExoPlayer.Builder(context).build().apply { addListener(listener) }
    }

    private val exoPlayerB: ExoPlayer by lazy {
        ExoPlayer.Builder(context).build().apply { addListener(listener) }
    }

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

        if (media.loopable) {
            // 可循环音频直接使用循环模式
            reset_player(exoPlayerA, mediaItem, volume)
            exoPlayerA.setRepeatMode(Player.REPEAT_MODE_ONE)
            exoPlayerA.play()
        } else {
            // 其它音频循环通过双实例交叉淡化
            reset_player(exoPlayerA, mediaItem, volume)
            reset_player(exoPlayerB, mediaItem, volume)
            // 关闭循环模式
            exoPlayerA.setRepeatMode(Player.REPEAT_MODE_OFF)
            exoPlayerB.setRepeatMode(Player.REPEAT_MODE_OFF)
            // 实际交叉位置由原交叉位置和延迟决定
            val position = (media.overlapPositionSecs * 1000 - media.delayMs).toLong()
            addMessage(Role.A, exoPlayerA, position)
            exoPlayerA.play()
        }

        Log.i(LOG_TAG, "Started playing media: ${media.path} with volume: ${volume}")
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
