use tauri::{command, AppHandle, Runtime};

use crate::models::*;
use crate::AndroidBackendExt;
use crate::Result;

#[command]
pub(crate) async fn ping<R: Runtime>(
    app: AppHandle<R>,
    payload: PingRequest,
) -> Result<PingResponse> {
    app.backend().ping(payload)
}

#[command]
pub(crate) async fn toast<R: Runtime>(app: AppHandle<R>, payload: ToastRequest) -> Result<()> {
    app.backend().toast(payload)
}

#[command]
pub(crate) async fn play<R: Runtime>(app: AppHandle<R>) -> Result<()> {
    app.backend().play()
}

#[command]
pub(crate) async fn pause<R: Runtime>(app: AppHandle<R>) -> Result<()> {
    app.backend().pause()
}

#[command]
pub(crate) async fn reset<R: Runtime>(app: AppHandle<R>) -> Result<()> {
    app.backend().reset()
}

#[command]
pub(crate) async fn next<R: Runtime>(app: AppHandle<R>) -> Result<()> {
    app.backend().next()
}

#[command]
#[allow(non_snake_case)]
pub(crate) async fn previewSound<R: Runtime>(
    app: AppHandle<R>,
    payload: PreviewSoundRequest,
) -> Result<()> {
    app.backend().preview_sound(payload)
}

#[command]
#[allow(non_snake_case)]
pub(crate) async fn writeSettings<R: Runtime>(
    app: AppHandle<R>,
    payload: WriteSettingsRequest,
) -> Result<()> {
    app.backend().write_settings(payload)
}

#[command]
pub(crate) async fn exit<R: Runtime>(app: AppHandle<R>) -> Result<()> {
    app.backend().exit()
}
