package com.plugin.backend

class Settings(
    var tickSound: String,
    var tickVolume: Float,
    var alarmVolume: Float,
    var promptVolume: Float
) {
    override fun toString(): String {
        return "Settings(tickSound='$tickSound', tickVolume=$tickVolume, alarmVolume=$alarmVolume, promptVolume=$promptVolume)"
    }
}

interface SettingsCallback {
    fun onSettingsUpdated(settings: Settings) // 设置更新回调
}
