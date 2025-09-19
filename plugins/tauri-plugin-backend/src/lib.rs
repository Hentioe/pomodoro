use tauri::{
    plugin::{Builder, TauriPlugin},
    Manager, Runtime,
};

pub use models::*;

#[cfg(desktop)]
mod desktop;
#[cfg(mobile)]
mod mobile;

mod commands;
mod error;
mod models;

pub use error::{Error, Result};

#[cfg(desktop)]
use desktop::AndroidBackend;
#[cfg(mobile)]
use mobile::AndroidBackend;

/// Extensions to [`tauri::App`], [`tauri::AppHandle`] and [`tauri::Window`] to access the backend APIs.
pub trait AndroidBackendExt<R: Runtime> {
    fn backend(&self) -> &AndroidBackend<R>;
}

impl<R: Runtime, T: Manager<R>> crate::AndroidBackendExt<R> for T {
    fn backend(&self) -> &AndroidBackend<R> {
        self.state::<AndroidBackend<R>>().inner()
    }
}

/// Initializes the plugin.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("backend")
        .invoke_handler(tauri::generate_handler![
            commands::ping,
            commands::toast,
            commands::play,
            commands::pause,
            commands::reset,
            commands::next,
            commands::previewSound,
            commands::writeSettings,
            commands::exit
        ])
        .setup(|app, api| {
            #[cfg(mobile)]
            let backend = mobile::init(app, api)?;
            #[cfg(desktop)]
            let backend = desktop::init(app, api)?;
            app.manage(backend);
            Ok(())
        })
        .build()
}
