import { Dict } from "../i18n";

export const dict: Dict = {
  app: {
    name: "Pomodoro",
    description: "Efficiently focus and easily manage your time",
  },
  header: {
    no_target: "No Target",
    todo_manage: "Todo Management",
  },
  // 弹窗组件
  dialog: {
    standard: {
      confirm: "Confirm",
      cancel: "Cancel",
    },
    controls: {
      exit: {
        title: "Exit Confirmation",
        message: "The Pomodoro timer is still running. Are you sure you want to exit?",
      },
    },
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
    refer: {
      // 番茄工作法介绍文章的标题
      intro: "Introduction to Pomodoro Technique",
      // Tauri 介绍文章的标题
      tauri: "The Powerful Presentation of Cross-Platform Application Development",
    },
    // 按钮
    button: {
      confirm: "OK",
    },
  },
  // 设置
  settings: {
    title: "Settings",
    timer: "TIMER",
    focus_duration: "Focus duration",
    short_break_duration: "Short break duration",
    long_break_duration: "Long break duration",
    minutes: "minutes",
    volume: "VOLUME",
    tick_sound: "Tick sound",
    alarm_sound: "Alarm sound",
    prompt_sound: "Prompt sound",
    background_sound: "Background sound",
    button: {
      reset: "Reset to Default",
      save: "Save",
    },
  },
  // 声音定制
  sounds: {
    title: "Sound Customization",
    tick_sound: "Tick sound",
    background_music: "Background sound",
    none: "None",
    // 滴答声
    tick: {
      pointer: "Pointer",
      tick_tock: "Tick Tock",
      mokugyo: "Mokugyo",
      ekg: "EKG",
    },
    // 背景声
    background: {
      timer: "Timer",
      rain: "Rain",
      rain_thunder: "Thunderstorm",
      wind_strong: "Strong wind",
      beach: "Beach",
      bonfire: "Bonfire",
      nature_stream: "Nature (Stream)",
      nature_crickets: "Nature (Crickets)",
    },
  },
  // 发现新版本
  new_version: {
    title: "Found New Version",
    update_now: "Update Now",
    download_from_browser: "Download from Browser",
    downloading_notice: "Downloading (check notification)",
    downloading_notice_browser: "Check browser downloads",
    no_release_notes: "No release notes available",
    unknown_version: "Unknown",
  },
  // 任务
  todo: {
    title: "TODO",
    save: "Save",
    add: "Add",
    close: "Close",
    range: {
      today: "Today",
      recent: "Recent",
      finished: "Finished",
    },
    actions: {
      focus: "Focus",
      cancel: "Cancel",
      edit: "Edit",
      delete: "Delete",
    },
    editing: {
      subject_placeholder: "Enter TODO subject",
    },
    initial_todos: {
      start_a_pomodoro: "Start a Pomodoro",
      swipe_left_to_operate: "Swipe left to operate this task",
      this_is_a_finished_todo: "This is a finished task",
    },
  },
};
