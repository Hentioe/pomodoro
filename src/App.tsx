import { createSignal, onCleanup, onMount } from "solid-js";
import "./App.css";
import { Icon } from "@iconify-icon/solid";
import { getCurrentWindow } from "@tauri-apps/api/window";
import FlipClock from "./flip-clock";
import {} from "./icons";
import { info } from "@tauri-apps/plugin-log";
import classNames from "classnames";
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

  const handleNext = async () => {
    await next();
  };

  const handleExit = async () => {
    await exit();
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
  });

  onCleanup(() => {
    dragEl?.removeEventListener("mousedown", dragEvent);
  });

  // 番茄指示器
  const TomatoIndicator = () => {
    return (
      <div
        id="tomato-indicator"
        data-state={phase()}
        onClick={handleNext}
        class="h-full rounded-full flex justify-centwhite text-blacker items-center"
      >
        <Icon
          icon="tomato"
          style={{ filter: "drop-shadow(5px 5px 5px rgba(0, 0, 0, 0.25))" }}
          data-state={phase()}
          class="w-[2.25rem] text-[2.25rem] transition-colors duration-800"
        />
      </div>
    );
  };

  return (
    <main class="h-full mx-[1rem] flex flex-col justify-between items-center px-[1rem] relative">
      <Header />
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

      <div
        class={classNames([
          "absolute bottom-[-3.5rem] z-10 h-[3.5rem] bg-gray-800 text-zinc-300 shadow-window rounded-full flex justify-center items-center px-[1rem]",
          "transition-all duration-700",
          { "bottom-[2rem]": loaded() },
        ])}
      >
        <div class="flex items-center gap-[1.25rem]">
          <TomatoIndicator />
          <div class="w-[1px] h-[1.25rem] bg-gray-500" />
        </div>
        <div class="flex items-center gap-[1.25rem] pl-[1.25rem]">
          <ControlButton onClick={handleTogglePlay} icon={isPlaying() ? "mingcute:pause-fill" : "mingcute:play-fill"} />
          <ControlButton onClick={reset} icon="humbleicons:refresh" />
          <ControlButton onClick={handleExit} icon="noto-v1:cross-mark" />
        </div>
      </div>
    </main>
  );
}

const ControlButton = (props: { icon: string; onClick?: () => void }) => {
  const handleClick = () => {
    if (props.onClick) {
      props.onClick();
    }
  };

  return (
    <div
      onClick={handleClick}
      class="control-btn w-[2rem] h-[2rem] text-gray-600 rounded-full flex justify-center items-center cursor-pointer"
    >
      <Icon icon={props.icon} class="w-[1.25rem] text-[1.25rem]" />
    </div>
  );
};

export default App;
