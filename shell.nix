let
  pkgs = import <nixpkgs> { };
in
pkgs.mkShell {
  nativeBuildInputs = with pkgs; [
    pkg-config
    bun
  ];

  buildInputs = with pkgs; [
    cairo
    libsoup_3
    webkitgtk_4_1
    alsa-lib
  ];

  GIO_MODULE_DIR = "${pkgs.glib-networking}/lib/gio/modules/";
}
