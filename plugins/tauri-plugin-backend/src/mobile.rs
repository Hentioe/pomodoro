use serde::de::DeserializeOwned;
use tauri::{
    plugin::{PluginApi, PluginHandle},
    AppHandle, Runtime,
};

use crate::models::*;

#[cfg(target_os = "ios")]
tauri::ios_plugin_binding!(init_plugin_backend);

// initializes the Kotlin or Swift plugin classes
pub fn init<R: Runtime, C: DeserializeOwned>(
    _app: &AppHandle<R>,
    api: PluginApi<R, C>,
) -> crate::Result<AndroidBackend<R>> {
    #[cfg(target_os = "android")]
    let handle = api.register_android_plugin("com.plugin.backend", "Plugin")?;
    #[cfg(target_os = "ios")]
    let handle = api.register_ios_plugin(init_plugin_backend)?;
    Ok(AndroidBackend(handle))
}

/// Access to the backend APIs.
pub struct AndroidBackend<R: Runtime>(PluginHandle<R>);

impl<R: Runtime> AndroidBackend<R> {
    pub fn ping(&self, payload: PingRequest) -> crate::Result<PingResponse> {
        self.0
            .run_mobile_plugin("ping", payload)
            .map_err(Into::into)
    }

    pub fn toast(&self, payload: ToastRequest) -> crate::Result<()> {
        self.0
            .run_mobile_plugin("toast", payload)
            .map_err(Into::into)
    }

    pub fn play(&self) -> crate::Result<()> {
        self.0.run_mobile_plugin("play", ()).map_err(Into::into)
    }

    pub fn pause(&self) -> crate::Result<()> {
        self.0.run_mobile_plugin("pause", ()).map_err(Into::into)
    }

    pub fn reset(&self) -> crate::Result<()> {
        self.0.run_mobile_plugin("reset", ()).map_err(Into::into)
    }

    pub fn next(&self) -> crate::Result<()> {
        self.0.run_mobile_plugin("next", ()).map_err(Into::into)
    }

    pub fn preview_sound(&self, payload: PreviewSoundRequest) -> crate::Result<()> {
        self.0
            .run_mobile_plugin("previewSound", payload)
            .map_err(Into::into)
    }

    pub fn write_settings(&self, payload: WriteSettingsRequest) -> crate::Result<()> {
        self.0
            .run_mobile_plugin("writeSettings", payload)
            .map_err(Into::into)
    }

    pub fn exit(&self) -> crate::Result<()> {
        self.0.run_mobile_plugin("exit", ()).map_err(Into::into)
    }
}
