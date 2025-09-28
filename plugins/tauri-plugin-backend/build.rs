const COMMANDS: &[&str] = &[
    "ping",
    "toast",
    "play",
    "pause",
    "reset",
    "next",
    "exit",
    "previewSound",
    "writeSettings",
    "downloadPackage",
    "registerListener",
];

fn main() {
    tauri_plugin::Builder::new(COMMANDS)
        .android_path("android")
        .ios_path("ios")
        .build();
}
