use crate::sounds::Sound;
use tauri::AppHandle;

mod sounds;

#[tauri::command]
fn tick(handle: AppHandle) {
    Sound::Tick.play(&handle);
}

#[tauri::command]
fn exit(handle: AppHandle) {
    handle.exit(0);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![tick, exit])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
