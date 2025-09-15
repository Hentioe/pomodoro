use std::time::Duration;

use crate::sounds::Sound;
use tauri::AppHandle;
use tauri_plugin_log::{Target, TargetKind};
use tokio::time::sleep;

mod sounds;

#[tauri::command]
async fn tick(handle: AppHandle) {
    Sound::Tick.play(&handle).await;
}

#[tauri::command]
async fn done(handle: AppHandle, next_state: String) {
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
fn exit(handle: AppHandle) {
    handle.exit(0);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::new()
                .targets([
                    Target::new(TargetKind::Stdout),
                    Target::new(TargetKind::LogDir { file_name: None }),
                    Target::new(TargetKind::Webview),
                ])
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_backend::init()) // Android 后端插件
        .invoke_handler(tauri::generate_handler![tick, done, exit])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
