with (import <nixpkgs>) {
  config = {
    android_sdk.accept_license = true;
    allowUnfree = true;
  };
};
let
  androidComposition = androidenv.composeAndroidPackages {
    platformVersions = [
      "34"
      "35"
      "36"
    ];
    buildToolsVersions = [ "36.0.0" ];
    cmakeVersions = [ "4.1.0" ];
    includeNDK = true;
    ndkVersion = "28.2.13676358"; # 此版本号需要和 build.gradle.kts 中的 ndkVersion 保持一致
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

  # NDK 构建工具版本
  NDK_TOOLCHAINS_VERSION = "35";
  # SDK 构建工具版本
  SDK_BUILD_TOOLS_VERSION = "36.0.0";
  # 修复前端网络故障
  GIO_MODULE_DIR = "${pkgs.glib-networking}/lib/gio/modules/";

  # 指定工具位置
  shellHook = ''
    export CARGO_TARGET_AARCH64_LINUX_ANDROID_LINKER="$ANDROID_NDK_HOME/toolchains/llvm/prebuilt/linux-x86_64/bin/aarch64-linux-android$NDK_TOOLCHAINS_VERSION-clang"
    export CARGO_TARGET_AARCH64_LINUX_ANDROID_RUSTFLAGS="-L $ANDROID_NDK_HOME/toolchains/llvm/prebuilt/linux-x86_64/sysroot/usr/lib/aarch64-linux-android/$NDK_TOOLCHAINS_VERSION"
    export CARGO_TARGET_X86_64_LINUX_ANDROID_LINKER="$ANDROID_NDK_HOME/toolchains/llvm/prebuilt/linux-x86_64/bin/x86_64-linux-android$NDK_TOOLCHAINS_VERSION-clang"
    export CARGO_TARGET_X86_64_LINUX_ANDROID_RUSTFLAGS="-L $ANDROID_NDK_HOME/toolchains/llvm/prebuilt/linux-x86_64/sysroot/usr/lib/x86_64-linux-android/$NDK_TOOLCHAINS_VERSION"
    export GRADLE_OPTS="-Dorg.gradle.project.android.aapt2FromMavenOverride=$ANDROID_SDK_ROOT/build-tools/$SDK_BUILD_TOOLS_VERSION/aapt2"
  '';
}
