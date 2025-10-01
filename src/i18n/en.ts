import { Dict } from "../i18n";

export const dict: Dict = {
  app: {
    name: "Pomodoro",
    description: "Efficiently focus and easily manage your time",
  },
  // 检查更新
  update: {
    checking: "Checking for updates...",
    latest: "You are on the latest version",
    error: "Error occurred while checking for updates: {{ message }}",
    failed: "Failed to check for updates",
  },
  // 关于弹窗
  about: {
    title: "About",
    app_version: "App Version",
    platform: "Platform",
    unknown_value: "Unknown",
    this_app_is: "This app is developed by",
    developed_free_product: "a free product based on",
    built_with_framework: "built with the framework.",
    more_info_refer: "For more information, please refer to",
    refer: {
      // 番茄工作法介绍文章的标题
      intro: "Introduction to Pomodoro Technique",
      // Tauri 介绍文章的标题
      tauri: "The Powerful Presentation of Cross-Platform Application Development",
    },
    // 按钮
    button: {
      confirm: "Confirm",
    },
  },
};
