use rodio::{Decoder, OutputStream, OutputStreamBuilder};
use std::{fs::File, io::BufReader, path::PathBuf, sync::LazyLock};
use tauri::{path::BaseDirectory, AppHandle, Manager};

static RODIO_HANDLE: LazyLock<OutputStream> = LazyLock::new(|| {
    OutputStreamBuilder::open_default_stream().expect("open default audio stream")
});

pub enum Sound {
    Tick,
}

impl Sound {
    pub fn path(&self, app_handle: &AppHandle) -> PathBuf {
        let file_path = match self {
            Sound::Tick => "sounds/tick.wav",
        };

        app_handle
            .path()
            .resolve(file_path, BaseDirectory::Resource)
            .unwrap()
    }

    pub fn play(&self, app_handle: &AppHandle) {
        let sound_file = self.path(app_handle);
        let file = BufReader::new(File::open(sound_file).unwrap());
        let sink = rodio::Sink::connect_new(RODIO_HANDLE.mixer());
        sink.set_volume(0.2); // 设置音量
        sink.append(Decoder::try_from(file).unwrap());
        sink.detach(); // 不阻塞当前线程
    }
}
