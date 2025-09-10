package com.plugin.backend

class PomodoroState(
    var phase: PomodoroPhase,
    var remainingSeconds: Int,
    var isPlaying: Boolean,
    var cycleCount: Int
) {
    override fun toString(): String {
        return "PomodoroState(phase=${phase.value}, remainingSeconds=$remainingSeconds, isPlaying=$isPlaying, cycleCount=$cycleCount)"
    }
}
