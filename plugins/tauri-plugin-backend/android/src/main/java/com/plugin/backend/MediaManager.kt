package com.plugin.backend

import android.animation.ValueAnimator
import android.content.Context
import android.os.Looper
import android.util.Log
import android.view.animation.LinearInterpolator
import androidx.media3.common.AudioAttributes
import androidx.media3.common.C
import androidx.media3.common.MediaItem
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.exoplayer.PlayerMessage

enum class LocalMedia(
    val path: String, // 文件路径
    val overlapPositionSecs: Float, // 重叠位置（秒）
    val delayMs: Int = -200, // 经初步测试，目前的双实例交叉实现大概有接近 0.2 秒的延迟。故提前 200 毫秒开始交叉
    val is_seamless: Boolean = false // 是否为（可直接循环的）无缝音频
) {
    TIMER("musics/timer.ogg", 0.0f, 0, true), // 计时器，循环音频
    RAIN("musics/rain.ogg", 0.0f, 0, true), // 雨声，循环音频
    RAIN_THUNDER("musics/rain-thunder.ogg", 0.0f, 0, true), // 雷雨，循环音频
    WIND_STRONG("musics/wind-strong.ogg", 27f), // 强风，27 秒位置重叠
    BONFIRE("musics/bonfire.ogg", 49f), // 篝火，49 秒位置重叠
    BEACH("musics/beach.ogg", 67f), // 海滩，67 秒位置重叠
    NATURE_STREAM("musics/nature-stream.ogg", 29f), // 自然（溪流），29 秒位置重叠
    NATURE_CRICKETS("musics/nature-crickets.ogg", 40f); // 自然（虫鸣），40 秒位置重叠

    companion object {
        fun from_setting_key(key: String?): LocalMedia? {
            return when (key) {
                "timer_music" -> TIMER
                "rain_music" -> RAIN
                "rain-thunder_music" -> RAIN_THUNDER
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
                if (events.contains(Player.EVENT_PLAYBACK_STATE_CHANGED)) {
                    if (player.playbackState == Player.STATE_READY) {
                        Log.d(LOG_TAG, "Player is ready and started playing")
                    } else if (player.playbackState == Player.STATE_ENDED) {
                        Log.d(LOG_TAG, "Player playback ended")
                    }
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
    fun reset_player(player: ExoPlayer, mediaItem: MediaItem, volume: Float) {
        player.stop()
        player.clearMediaItems()
        player.setAudioAttributes(
            AudioAttributes.Builder()
                .setUsage(C.USAGE_MEDIA) // 设置音频用途为媒体
                .setContentType(C.CONTENT_TYPE_MUSIC) // 设置内容类型为音乐
                .build(),
            false)
        player.setMediaItem(mediaItem)
        player.volume = volume
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
                    Log.d(LOG_TAG, "exoPlayerB volume: ${exoPlayerB.volume}")
                } else if (payload is Payload && payload.role == Role.B) {
                    Log.i(LOG_TAG, "Switching to Player A")
                    exoPlayerA.seekTo(0)
                    addMessage(Role.A, exoPlayerA, payload.overlapPositionMs)
                    exoPlayerA.play()
                    Log.d(LOG_TAG, "exoPlayerA volume: ${exoPlayerA.volume}")
                }
            }
        }

    fun play(media: LocalMedia, volume: Float?) {
        stop() // 停止可能的播放
        isLooping = true
        val assetUri = "asset:///${media.path}"
        val mediaItem = MediaItem.fromUri(assetUri)
        val volume = volume ?: 0.6f

        if (media.is_seamless) {
            // 可循环音频直接使用循环模式
            reset_player(exoPlayerA, mediaItem, 0f)
            exoPlayerA.setRepeatMode(Player.REPEAT_MODE_ONE)
            exoPlayerA.play()
            // 音量渐入
            val animator = ValueAnimator.ofFloat(0f, volume)
            animator.duration = 2000 // 渐入时长
            animator.interpolator = LinearInterpolator() // 线性渐变
            animator.addUpdateListener { animation ->
                val volume = animation.animatedValue as Float
                exoPlayerA.setVolume(volume) // 更新音量
            }
            animator.start()
        } else {
            // 其它音频循环通过双实例交叉淡化
            reset_player(exoPlayerA, mediaItem, volume)
            reset_player(exoPlayerB, mediaItem, volume)
            // 关闭循环模式
            exoPlayerA.setRepeatMode(Player.REPEAT_MODE_OFF)
            exoPlayerB.setRepeatMode(Player.REPEAT_MODE_OFF)
            // 实际交叉位置由原交叉位置和延迟决定
            val position = (media.overlapPositionSecs * 1000 + media.delayMs).toLong()
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
