use rodio::{Decoder, OutputStream, OutputStreamBuilder};
use std::{fs::File, io::BufReader, path::PathBuf, sync::LazyLock};
use tauri::{path::BaseDirectory, AppHandle, Manager};

static RODIO_HANDLE: LazyLock<OutputStream> = LazyLock::new(|| {
    OutputStreamBuilder::open_default_stream().expect("open default audio stream")
});

pub enum Sound {
    Tick,
    Alarm,
    WorkingAlert,
    ShortBreakAlert,
    LongBreakAlert,
}
use Sound::*;

impl Sound {
    pub fn path(&self, app_handle: &AppHandle) -> PathBuf {
        let file_path = match self {
            Tick => "sounds/tick.wav",
            Alarm => "sounds/alarm.wav",
            WorkingAlert => "sounds/alerts/working.wav", // Time to focus
            ShortBreakAlert => "sounds/alerts/short_break.wav", // Time for a short rest
            LongBreakAlert => "sounds/alerts/long_break.wav", // Time for a longer rest
        };

        app_handle
            .path()
            .resolve(file_path, BaseDirectory::Resource)
            .unwrap()
    }

    pub fn volume(&self) -> f32 {
        match self {
            Tick => 0.2,
            Alarm => 0.8,
            WorkingAlert => 0.8,
            ShortBreakAlert => 0.6,
            LongBreakAlert => 0.6,
        }
    }

    pub fn play(&self, app_handle: &AppHandle) {
        let sound_file = self.path(app_handle);
        let file = BufReader::new(File::open(sound_file).unwrap());
        let sink = rodio::Sink::connect_new(RODIO_HANDLE.mixer());
        sink.set_volume(self.volume());
        sink.append(Decoder::try_from(file).unwrap());
        sink.detach(); // 不阻塞当前线程
    }

    pub fn duration_secs(&self) -> u64 {
        match self {
            Tick => 0,
            Alarm => 3,
            WorkingAlert => 2,
            ShortBreakAlert => 2,
            LongBreakAlert => 2,
        }
    }
}
