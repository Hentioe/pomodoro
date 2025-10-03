package com.plugin.backend

data class Settings(
    var tickSound: String,
    var backgroundMusic: String,
    var tickVolume: Float,
    var alarmVolume: Float,
    var promptVolume: Float,
    var backgroundVolume: Float,
    var focusMinutes: Int,
    var shortBreakMinutes: Int,
    var longBreakMinutes: Int,
) {

    companion object {
        val DEFAULT: Settings by lazy {
            Settings(
                tickSound = "default_tick",
                backgroundMusic = "none",
                tickVolume = 0.7f,
                alarmVolume = 0.6f,
                promptVolume = 0.5f,
                backgroundVolume = 0.6f,
                focusMinutes = 25,
                shortBreakMinutes = 5,
                longBreakMinutes = 15)
        }
    }

    override fun toString(): String {
        return "Settings(tickSound='$tickSound', backgroundMusic='$backgroundMusic', tickVolume=$tickVolume, alarmVolume=$alarmVolume, promptVolume=$promptVolume, backgroundVolume=$backgroundVolume, focusMinutes=$focusMinutes, shortBreakMinutes=$shortBreakMinutes, longBreakMinutes=$longBreakMinutes)"
    }
}

interface SettingsCallback {
    fun onSettingsUpdated(settings: Settings) // 设置更新回调
}
