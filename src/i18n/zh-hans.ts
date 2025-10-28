export const dict = {
  app: {
    name: "番茄钟",
    description: "高效专注，轻松管理时间",
  },
  header: {
    no_target: "无目标",
    todo_manage: "任务管理",
  },
  // 弹窗组件
  dialog: {
    standard: {
      confirm: "确认",
      cancel: "取消",
    },
    controls: {
      exit: {
        title: "退出确认",
        message: "番茄钟还在计时中，确定要退出吗？",
      },
    },
  },
  // 检查更新
  update: {
    checking: "正在检查更新...",
    latest: "当前已是最新版本",
    error: "检查更新时发生错误：{{ message }}",
    failed: "检查更新失败",
  },
  // 关于弹窗
  about: {
    title: "关于",
    app_version: "应用版本",
    platform: "运行平台",
    unknown_value: "未知",
    this_app_is: "本应用是由",
    developed_free_product: "开发的免费产品，基于",
    built_with_framework: "框架构建。",
    refer: {
      // 番茄工作法介绍文章的标题
      intro: "入门番茄工作法",
      // Tauri 介绍文章的标题
      tauri: "跨端应用开发前景的强大展现力",
    },
    // 按钮
    button: {
      confirm: "确认",
    },
  },
  // 设置
  settings: {
    title: "设置",
    timer: "定时器",
    focus_duration: "专注时长",
    short_break_duration: "短休息时长",
    long_break_duration: "长休息时长",
    minutes: "分钟",
    volume: "音量",
    tick_sound: "滴答声",
    alarm_sound: "闹铃声",
    prompt_sound: "提示声",
    background_sound: "背景声",
    button: {
      reset: "重置为默认值",
      save: "保存",
    },
  },
  // 声音定制
  sounds: {
    title: "声音定制",
    tick_sound: "滴答声",
    background_music: "背景声",
    none: "无",
    // 滴答声
    tick: {
      clock_hand: "指针",
      clock_tick_tock: "钟摆",
      mokugyo: "木鱼",
      ekg: "心电",
    },
    // 背景声
    background: {
      timer: "定时器",
      rain_strong: "大雨",
      rain_thunder: "雷雨",
      wind_strong: "强风",
      beach: "海滩",
      bonfire: "篝火",
      nature_stream: "溪流",
      nature_crickets: "虫鸣",
    },
  },
  // 发现新版本
  new_version: {
    title: "发现新版本",
    update_now: "立即更新",
    download_from_browser: "从浏览器下载",
    downloading_notice: "下载中，请检查通知",
    downloading_notice_browser: "请留意浏览器的下载任务",
    no_release_notes: "暂无更新日志",
    unknown_version: "未知",
  },
  // 任务
  todo: {
    title: "任务",
    save: "保存",
    add: "添加",
    close: "关闭",
    range: {
      today: "今天",
      recent: "最近",
      finished: "完成",
    },
    actions: {
      focus: "专注",
      cancel: "取消",
      edit: "编辑",
      delete: "删除",
    },
    editing: {
      subject_placeholder: "输入待办主题",
    },
    empty: {
      no_today_todos: "添加一些任务吧~",
      no_recent_todos: "没有过时任务哦~",
      no_finished_todos: "还没有完成任何任务哦~",
    },
    initial_todos: {
      start_a_pomodoro: "启动一个番茄钟",
      swipe_left_to_operate: "向左滑操作本任务",
      this_is_a_finished_todo: "这是一个已完成的任务",
    },
  },
};
