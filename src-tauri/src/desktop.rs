use crate::sounds::Sound;
use std::time::Duration;
use tauri::AppHandle;
use tokio::time::sleep;

#[tauri::command]
pub async fn tick(handle: AppHandle) {
    Sound::Tick.play(&handle).await;
}
#[tauri::command]
pub async fn done(handle: AppHandle, next_state: String) {
    Sound::Alarm.play(&handle).await;
    sleep(Duration::from_secs(Sound::Alarm.duration_secs())).await;
    let state_sound = match next_state.as_str() {
        "focus" => Sound::FocusAlert,
        "short_break" => Sound::ShortBreakAlert,
        "long_break" => Sound::LongBreakAlert,
        _ => panic!("unknown state"),
    };

    state_sound.play(&handle).await;
    sleep(Duration::from_secs(state_sound.duration_secs())).await;
}

#[tauri::command]
pub fn exit(handle: AppHandle) {
    handle.exit(0);
}
