import { createSignal, JSX, onCleanup, onMount } from "solid-js";
import "./App.css";
import { getIdentifier, getVersion } from "@tauri-apps/api/app";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { debug, error, info } from "@tauri-apps/plugin-log";
import {
  exit,
  next,
  onPomodoroUpdated,
  pause,
  ping,
  play,
  PomodoroPhase,
  PomodoroState,
  reset,
} from "tauri-plugin-backend-api";
// import FlipClock from "./flip-clock";
import FlipClock3D from "./flip-clock-3d";
import { isMobile } from "./helper";
import Controls from "./layouts/Controls";
import Header from "./layouts/Header";
import { UpdateChecker } from "./update-checker";

const appWindow = isMobile ? getCurrentWindow() : null;

function App() {
  const [phase, setPhase] = createSignal<PomodoroPhase>("focus");
  const [totalSeconds, setTotalSeconds] = createSignal(0);
  const [isPlaying, setIsPlaying] = createSignal(false);
  const [loaded, setLoaded] = createSignal(false);
  const [update, setUpdate] = createSignal<Update | undefined>(undefined);
  const [updateChecker, setUpdateChecker] = createSignal<UpdateChecker | undefined>(undefined);

  // let flipClock: FlipClock;
  let clock: FlipClock3D;
  let clockContainerEl: HTMLDivElement | undefined;

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

    // flipClock.updateTime(minutes, seconds);
    clock.update({ minutes, seconds });
  };

  const dragEvent = (e: MouseEvent) => {
    if (e.buttons === 1) {
      // Primary (left) button
      appWindow?.startDragging(); // Else start dragging
    }
  };

  const handlePomodoroUpdated = (state: PomodoroState) => {
    setPhase(state.phase);
    setTotalSeconds(state.remainingSeconds);
    setIsPlaying(state.isPlaying);
    updateTimeDisplay();
  };

  onMount(async () => {
    // flipClock = new FlipClock();
    clock = new FlipClock3D(clockContainerEl!);
    updateTimeDisplay();
    if (isMobile) {
      await onPomodoroUpdated(handlePomodoroUpdated);
      await ping("--push=state");
    }

    clockContainerEl?.addEventListener("mousedown", dragEvent);
    setLoaded(true);

    // 创建一个更新检查器，并立即检查更新
    const checker = new UpdateChecker({
      appId: await getIdentifier(),
      platform: "android",
      channel: "dev",
      version: await getVersion(),
      architecture: "aarch64",
    });
    setUpdateChecker(checker);

    const result = await checker.checkNow();

    if (result.success) {
      const update = result.payload;
      if (update.available) {
        info(`New version available: ${update.latest}`);
        setUpdate(update);
      } else {
        debug("Check for updates: no updates available");
      }
    } else {
      error("Check for updates failed: " + result.message);
    }
  });

  onCleanup(() => {
    clockContainerEl?.removeEventListener("mousedown", dragEvent);
  });

  return (
    <main class="h-full px-[1rem]  flex flex-col justify-between items-center relative">
      <Header update={update()} updateChecker={updateChecker()} />
      <div class="flex-1 flex w-full items-center">
        <div id="clock-container" class="animated" ref={clockContainerEl}>
          <FlipNumbers unit="min-tens" />
          <FlipNumbers unit="min-ones" />
          <FlipNumbers unit="sec-tens" />
          <FlipNumbers unit="sec-ones" />
        </div>
      </div>

      <Controls
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

const FlipNumbers = (props: { unit: string }) => {
  return (
    <ul class="flip" data-unit={props.unit}>
      <NumberCard>0</NumberCard>
      <NumberCard>0</NumberCard>
    </ul>
  );
};

const NumberCard = (props: { children: JSX.Element }) => {
  return (
    <li class="flip-item">
      <a class="number">
        <div class="up">
          <div class="shadow" />
          <div class="inn">{props.children}</div>
        </div>
        <div class="down">
          <div class="shadow" />
          <div class="inn">{props.children}</div>
        </div>
      </a>
    </li>
  );
};

export default App;
