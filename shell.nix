with (import <nixpkgs>) {
  config = {
    android_sdk.accept_license = true;
    allowUnfree = true;
  };
};
let
  androidComposition = androidenv.composeAndroidPackages {
    platformVersions = [ "34" "35" "36" ];
    buildToolsVersions = [ "35.0.0" ];
    cmakeVersions = [ "4.1.0" ];
    includeNDK = true;
    ndkVersion = "27.3.13750724";
    abiVersions = [
      "x86_64"
      "arm64-v8a"
    ];
  };
  androidSdk = androidComposition.androidsdk;
in
stdenv.mkDerivation {
  name = "build-environment";
  nativeBuildInputs = with pkgs; [
    pkg-config
    bun
    openjdk
    androidSdk
  ];

  buildInputs = with pkgs; [
    cairo
    libsoup_3
    webkitgtk_4_1
    alsa-lib
  ];

  JAVA_HOME = "${openjdk}";
  ANDROID_HOME = "${androidSdk}/libexec/android-sdk"; # Tauri 需要此变量
  ANDROID_SDK_ROOT = "${androidSdk}/libexec/android-sdk"; # Android 官方需要此变量
  NDK_HOME = "${androidSdk}/libexec/android-sdk/ndk-bundle"; # Tauri 需要此变量
  ANDROID_NDK_ROOT = "${androidSdk}/libexec/android-sdk/ndk-bundle"; # Tauri 需要此变量
  ANDROID_NDK_HOME = "${androidSdk}/libexec/android-sdk/ndk-bundle"; # Rust 需要此变量

  GIO_MODULE_DIR = "${pkgs.glib-networking}/lib/gio/modules/";

  shellHook = ''
    export CARGO_TARGET_AARCH64_LINUX_ANDROID_LINKER="$ANDROID_NDK_HOME/toolchains/llvm/prebuilt/linux-x86_64/bin/aarch64-linux-android35-clang"
    export CARGO_TARGET_AARCH64_LINUX_ANDROID_RUSTFLAGS="-L $ANDROID_NDK_HOME/toolchains/llvm/prebuilt/linux-x86_64/sysroot/usr/lib/aarch64-linux-android/35"
    export CARGO_TARGET_X86_64_LINUX_ANDROID_LINKER="$ANDROID_NDK_HOME/toolchains/llvm/prebuilt/linux-x86_64/bin/x86_64-linux-android35-clang"
    export CARGO_TARGET_X86_64_LINUX_ANDROID_RUSTFLAGS="-L $ANDROID_NDK_HOME/toolchains/llvm/prebuilt/linux-x86_64/sysroot/usr/lib/x86_64-linux-android/35"
    export GRADLE_OPTS="-Dorg.gradle.project.android.aapt2FromMavenOverride=$ANDROID_SDK_ROOT/build-tools/35.0.0/aapt2"
  '';
}
