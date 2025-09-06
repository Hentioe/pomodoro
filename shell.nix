let
  pkgs = import <nixpkgs> { };
in
pkgs.mkShell {
  nativeBuildInputs = [
    pkg-config
    bun
  ];

  buildInputs = [
    cairo
    libsoup_3
    webkitgtk_4_1
  ];
}
