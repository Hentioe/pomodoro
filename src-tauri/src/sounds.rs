use rodio::{Decoder, OutputStream, OutputStreamBuilder};
use std::{fs::File, io::BufReader, path::PathBuf, sync::LazyLock};
use tauri::{path::BaseDirectory, AppHandle, Manager};

static RODIO_HANDLE: LazyLock<OutputStream> = LazyLock::new(|| {
    OutputStreamBuilder::open_default_stream().expect("open default audio stream")
});

pub enum Sound {
    Tick,
    Alarm,
}

impl Sound {
    pub fn path(&self, app_handle: &AppHandle) -> PathBuf {
        let file_path = match self {
            Sound::Tick => "sounds/tick.wav",
            Sound::Alarm => "sounds/alarm.wav",
        };

        app_handle
            .path()
            .resolve(file_path, BaseDirectory::Resource)
            .unwrap()
    }

    pub fn play(&self, app_handle: &AppHandle) {
        let volume = match self {
            Sound::Tick => 0.2,
            Sound::Alarm => 0.8,
        };
        let sound_file = self.path(app_handle);
        let file = BufReader::new(File::open(sound_file).unwrap());
        let sink = rodio::Sink::connect_new(RODIO_HANDLE.mixer());
        sink.set_volume(volume);
        sink.append(Decoder::try_from(file).unwrap());
        sink.detach(); // 不阻塞当前线程
    }
}
