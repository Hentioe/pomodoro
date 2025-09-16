import { createSignal, onCleanup, onMount } from "solid-js";
import "./App.css";
import { getIdentifier, getVersion } from "@tauri-apps/api/app";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { fetch } from "@tauri-apps/plugin-http";
import { debug, error, info } from "@tauri-apps/plugin-log";
import {
  exit,
  next,
  onPomodoroUpdated,
  pause,
  play,
  PomodoroPhase,
  PomodoroState,
  reset,
} from "tauri-plugin-backend-api";
import FlipClock from "./flip-clock";
import Controller from "./layouts/Controls";
import Header from "./layouts/Header";

const appWindow = getCurrentWindow();

// 状态到时间的映射
const stateToTimeMap: Record<PomodoroPhase, number> = {
  "focus": 25 * 60, // 25分钟
  "short_break": 5 * 60, // 5分钟
  "long_break": 15 * 60, // 15分钟
};

function App() {
  const [phase, setPhase] = createSignal<PomodoroPhase>("focus");
  const [totalSeconds, setTotalSeconds] = createSignal(stateToTimeMap[phase()]);
  const [isPlaying, setIsPlaying] = createSignal(false);
  const [loaded, setLoaded] = createSignal(false);
  const [update, setUpdate] = createSignal<Update | undefined>(undefined);

  let flipClock: FlipClock;
  let dragEl: HTMLDivElement | undefined;

  const handleTogglePlay = async () => {
    if (isPlaying()) {
      await pause();
    } else {
      info("Play button clicked, starting play function");
      await play();
    }
  };

  const handleNext = async () => await next();
  const handleReset = async () => await reset();
  const handleExit = async () => {
    await exit();
    // 确认退出需要返回 true
    return true;
  };

  const updateTimeDisplay = () => {
    let minutes = Math.floor(totalSeconds() / 60); // 获取分钟数
    let seconds = totalSeconds() % 60; // 获取秒数

    flipClock.updateTime(minutes, seconds);
  };

  const dragEvent = (e: MouseEvent) => {
    if (e.buttons === 1) {
      // Primary (left) button
      appWindow.startDragging(); // Else start dragging
    }
  };

  const onUpdated = (data: PomodoroState) => {
    setPhase(data.phase);
    setTotalSeconds(data.remainingSeconds);
    setIsPlaying(data.isPlaying);
    updateTimeDisplay();
  };

  onMount(async () => {
    flipClock = new FlipClock();
    updateTimeDisplay();
    // 判断系统是否是 Android
    if (navigator.userAgent.indexOf("Android") > -1) {
      await onPomodoroUpdated(onUpdated);
    }
    dragEl?.addEventListener("mousedown", dragEvent);
    setLoaded(true);

    const resp = await fetch("https://pomodoro.hentioe.dev/api/update/check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        app_id: await getIdentifier(),
        platform: "android",
        channel: "dev",
        version: await getVersion(),
        architecture: "aarch64",
      }),
    });

    const updateInfo = await resp.json() as Api.Error | Api.Success<Update>;
    if (updateInfo.success) {
      const update = updateInfo.payload;
      if (update.available) {
        info(`New version available: ${update.latest}`);
        setUpdate(updateInfo.payload);
      } else {
        debug("Check for updates: no updates available");
      }
    } else {
      error("Check for updates failed: " + updateInfo.message);
    }
  });

  onCleanup(() => {
    dragEl?.removeEventListener("mousedown", dragEvent);
  });

  return (
    <main class="h-full mx-[1rem] flex flex-col justify-between items-center px-[1rem] relative">
      <Header update={update()} />
      <div class="flex-1 flex w-full items-center">
        <div class="clock-container cursor-grab" ref={dragEl}>
          <div class="digit-container" id="minute-ten">
            <div class="digit-display">0</div>
          </div>

          <div class="digit-container" id="minute-one">
            <div class="digit-display">0</div>
          </div>

          <div class="digit-container" id="second-ten">
            <div class="digit-display">0</div>
          </div>

          <div class="digit-container" id="second-one">
            <div class="digit-display">0</div>
          </div>
        </div>
      </div>

      <Controller
        loaded={loaded()}
        phase={phase()}
        isPlaying={isPlaying()}
        onTogglePlay={handleTogglePlay}
        onNext={handleNext}
        onReset={handleReset}
        onExit={handleExit}
      />
    </main>
  );
}

export default App;
