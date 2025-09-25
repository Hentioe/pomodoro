package com.plugin.backend

class Settings(
    var tickSound: String,
    var tickVolume: Float,
    var alarmVolume: Float,
    var promptVolume: Float,
    var backgroundVolume: Float,
    var focusMinutes: Int,
    var shortBreakMinutes: Int,
    var longBreakMinutes: Int,
) {
    override fun toString(): String {
        return "Settings(tickSound='$tickSound', tickVolume=$tickVolume, alarmVolume=$alarmVolume, promptVolume=$promptVolume, backgroundVolume=$backgroundVolume, focusMinutes=$focusMinutes, shortBreakMinutes=$shortBreakMinutes, longBreakMinutes=$longBreakMinutes)"
    }
}

interface SettingsCallback {
    fun onSettingsUpdated(settings: Settings) // 设置更新回调
}
