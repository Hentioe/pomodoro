use tauri_plugin_log::{Target, TargetKind};

#[cfg(not(target_os = "android"))]
mod desktop;
#[cfg(not(target_os = "android"))]
mod sounds;
#[cfg(not(target_os = "android"))]
use crate::desktop::{done, exit, tick};

#[cfg(target_os = "android")]
mod mobile;
#[cfg(target_os = "android")]
use crate::mobile::{done, exit, tick};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
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
