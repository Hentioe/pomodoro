use rodio::{Decoder, OutputStream, OutputStreamBuilder};
use std::{fs::File, io::BufReader, path::PathBuf, sync::Arc};
use tauri::AppHandle;
use tauri::{path::BaseDirectory, Manager};
use tokio::sync::{Mutex, MutexGuard, OnceCell};

#[cfg(not(target_os = "android"))]
static RODIO_HANDLE: OnceCell<Arc<Mutex<OutputStream>>> = OnceCell::const_new();

pub enum Sound {
    Tick,
    Alarm,
    FocusAlert,
    ShortBreakAlert,
    LongBreakAlert,
}
use Sound::*;

impl Sound {
    pub fn asset_path(&self) -> &'static str {
        match self {
            Tick => "sounds/tick.wav",
            Alarm => "sounds/alarm.wav",
            FocusAlert => "sounds/alerts/focus.wav", // Time to focus
            ShortBreakAlert => "sounds/alerts/short_break.wav", // Time for a short rest
            LongBreakAlert => "sounds/alerts/long_break.wav", // Time for a longer rest
        }
    }

    #[cfg(any(target_os = "windows", target_os = "linux", target_os = "macos"))]
    pub fn path(&self, app_handle: &AppHandle) -> PathBuf {
        let asset_path = self.asset_path();
        // 桌面系统通过标准方法获取路径
        app_handle
            .path()
            .resolve(asset_path, BaseDirectory::Resource)
            .unwrap()
    }

    #[cfg(target_os = "android")]
    pub fn path(&self, _app_handle: &AppHandle) -> PathBuf {
        let asset_path = self.asset_path();
        // Android 端 assets 会被复制到内部存储中，此处硬编码路径
        let mut path_buf = PathBuf::from("/data/data/dev.hentioe.tauripomodoro/files"); // Android 暂时硬编码路径
        path_buf.push(asset_path);

        path_buf
    }

    pub fn volume(&self) -> f32 {
        match self {
            #[cfg(any(target_os = "windows", target_os = "linux", target_os = "macos"))]
            Tick => 0.2,
            #[cfg(target_os = "android")]
            Tick => 0.5, // Android 端 tick 声音调大
            Alarm => 0.8,
            FocusAlert => 0.8,
            ShortBreakAlert => 0.6,
            LongBreakAlert => 0.6,
        }
    }

    pub async fn play(&self, app_handle: &AppHandle) {
        let sound_file = self.path(app_handle);
        let file = BufReader::new(File::open(sound_file).unwrap());
        let sink = rodio::Sink::connect_new(use_rodio_handle().await.mixer());
        sink.set_volume(self.volume());
        sink.append(Decoder::try_from(file).unwrap());
        sink.detach(); // 不阻塞当前线程
    }

    pub fn duration_secs(&self) -> u64 {
        match self {
            Tick => 0,
            Alarm => 3,
            FocusAlert => 2,
            ShortBreakAlert => 2,
            LongBreakAlert => 2,
        }
    }
}

async fn init_rodio_handle() -> Arc<Mutex<OutputStream>> {
    let stream =
        OutputStreamBuilder::open_default_stream().expect("failed to open default output stream");
    Arc::new(Mutex::new(stream))
}

async fn use_rodio_handle() -> MutexGuard<'static, OutputStream> {
    RODIO_HANDLE
        .get_or_init(init_rodio_handle)
        .await
        .lock()
        .await
}
