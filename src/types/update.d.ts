type Platform = "windows" | "macos" | "linux" | "android" | "ios";
type Architecture = "aarch64" | "armv7" | "i686" | "x86_64";

interface Changelog {
  summary: string;
  details?: string;
}

interface DownloadInfo {
  from: "github" | "blog" | "other";
  url: string;
  direct: boolean;
}

interface Update {
  available: true;
  platform: Platform;
  architecture: Architecture;
  latest: string; // 最新版本号
  changelog?: Changelog;
  download?: DownloadInfo[];
}
