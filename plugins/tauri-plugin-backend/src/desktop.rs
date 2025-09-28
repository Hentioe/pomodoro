use serde::de::DeserializeOwned;
use tauri::{plugin::PluginApi, AppHandle, Runtime};

use crate::models::*;

pub fn init<R: Runtime, C: DeserializeOwned>(
    app: &AppHandle<R>,
    _api: PluginApi<R, C>,
) -> crate::Result<AndroidBackend<R>> {
    Ok(AndroidBackend(app.clone()))
}

/// Access to the backend APIs.
pub struct AndroidBackend<R: Runtime>(AppHandle<R>);

impl<R: Runtime> AndroidBackend<R> {
    pub fn ping(&self, payload: PingRequest) -> crate::Result<PingResponse> {
        Ok(PingResponse {
            value: payload.value,
        })
    }

    pub fn toast(&self, _payload: ToastRequest) -> crate::Result<()> {
        Ok(())
    }

    pub fn play(&self) -> crate::Result<()> {
        Ok(())
    }

    pub fn pause(&self) -> crate::Result<()> {
        Ok(())
    }

    pub fn reset(&self) -> crate::Result<()> {
        Ok(())
    }

    pub fn next(&self) -> crate::Result<()> {
        Ok(())
    }

    pub fn preview_sound(&self, _payload: PreviewSoundRequest) -> crate::Result<()> {
        Ok(())
    }

    pub fn write_settings(&self, _payload: WriteSettingsRequest) -> crate::Result<()> {
        Ok(())
    }

    pub fn download_package(&self, _payload: DownloadPackageRequest) -> crate::Result<()> {
        Ok(())
    }

    pub fn exit(&self) -> crate::Result<()> {
        Ok(())
    }
}
