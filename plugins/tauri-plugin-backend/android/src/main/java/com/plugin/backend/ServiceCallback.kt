package com.plugin.backend

interface ServiceCallback {
    fun onPomodoroStateUpdated(state: PomodoroState) // 番茄钟状态更新回调
}
