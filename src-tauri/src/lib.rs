use std::time::Duration;

use crate::sounds::Sound;
use tauri::AppHandle;
use tokio::time::sleep;

mod sounds;

#[tauri::command]
fn tick(handle: AppHandle) {
    Sound::Tick.play(&handle);
}

#[tauri::command]
async fn done(handle: AppHandle, next_state: String) {
    Sound::Alarm.play(&handle);
    sleep(Duration::from_secs(Sound::Alarm.duration_secs())).await;
    let state_sound = match next_state.as_str() {
        "working" => Sound::WorkingAlert,
        "short_break" => Sound::ShortBreakAlert,
        "long_break" => Sound::LongBreakAlert,
        _ => panic!("unknown state"),
    };

    state_sound.play(&handle);
    sleep(Duration::from_secs(state_sound.duration_secs())).await;
}

#[tauri::command]
fn exit(handle: AppHandle) {
    handle.exit(0);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![tick, done, exit])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
