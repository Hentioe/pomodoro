import { createSignal, onCleanup, onMount } from "solid-js";
import "./App.css";
import { Icon } from "@iconify-icon/solid";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import classNames from "classnames";
import FlipClock from "./flip-clock";

const appWindow = getCurrentWindow();

// 状态到时间的映射
const stateToTimeMap: Record<PomodoroState, number> = {
  "working": 25 * 60, // 25分钟
  "short_break": 5 * 60, // 5分钟
  "long_break": 15 * 60, // 15分钟
};

function App() {
  const [status, setStatus] = createSignal<PomodoroState>("working");
  const [cycle, setCycle] = createSignal(0);
  const [totalSeconds, setTotalSeconds] = createSignal(stateToTimeMap[status()]);
  const [isPlaying, setIsPlaying] = createSignal(false);

  let timer: number;
  let flipClock: FlipClock;
  let dragEl: HTMLDivElement | undefined;

  const handleTogglePlay = () => {
    if (isPlaying()) {
      pause();
    } else {
      play();
    }
  };

  const play = async () => {
    if (isPlaying()) return;
    setIsPlaying(true);
    await createTimer();
  };

  const pause = () => {
    if (!isPlaying()) return;
    setIsPlaying(false);
    clearInterval(timer);
  };

  const restart = async () => {
    pause();
    setTotalSeconds(stateToTimeMap[status()]);
    await play();
  };

  const handleExit = () => {
    invoke("exit", {});
  };

  const createTimer = async () => {
    await nextTick();
    timer = setInterval(nextTick, 1000);
  };

  const nextTick = async () => {
    let minutes = Math.floor(totalSeconds() / 60); // 获取分钟数
    let seconds = totalSeconds() % 60; // 获取秒数

    flipClock.updateTime(minutes, seconds);
    // invoke tick command
    await invoke("tick", {});
    setTotalSeconds(totalSeconds() - 1);
    // 如果时间到达 0，进入下一个状态
    if (totalSeconds() < 0) {
      clearInterval(timer);
      // 等待 3 秒
      await invoke("done", {});
      await new Promise((resolve) => setTimeout(resolve, 3000));
      pause();

      switch (status()) {
        case "short_break":
          if (cycle() < 3) {
            setCycle(cycle() + 1); // 完成一个番茄周期
          }
          setStatus("working");
          break;
        case "long_break":
          setStatus("working");
          setCycle(0); // 重置周期计数
          break;

        default:
          if (cycle() === 3) { // 周期已达 3 次，进入长休息
            setStatus("long_break");
          } else {
            setStatus("short_break");
          }
          break;
      }

      setTotalSeconds(stateToTimeMap[status()]);
      play();
    }
  };

  const dragEvent = (e: MouseEvent) => {
    if (e.buttons === 1) {
      // Primary (left) button
      appWindow.startDragging(); // Else start dragging
    }
  };

  onMount(() => {
    flipClock = new FlipClock();
    // play();
    dragEl?.addEventListener("mousedown", dragEvent);
  });

  onCleanup(() => {
    clearInterval(timer);
    dragEl?.removeEventListener("mousedown", dragEvent);
  });

  // 番茄指示器
  const TomatoIndicator = () => {
    return (
      <div id="tomato-indicator" data-status={status()} class="h-full rounded-full flex justify-center items-center">
        <Icon icon="cbi:tomato" class="w-[28px] text-[28px]" />
      </div>
    );
  };

  return (
    <main class="h-full flex flex-col justify-center items-center">
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

      <div class="mt-[20px] h-[40px] bg-gray-700 text-zinc-300 shadow-window rounded-full flex justify-center items-center px-[10px]">
        <div class="flex items-center gap-[10px]">
          <TomatoIndicator />
          <div class="w-[1px] h-[20px] bg-gray-500" />
        </div>
        <div class="flex items-center gap-[20px] px-[10px]">
          <ControlButton onClick={handleTogglePlay} icon={isPlaying() ? "mingcute:pause-fill" : "mingcute:play-fill"} />
          <ControlButton onClick={restart} icon="ix:restore" />
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
      class={classNames([
        "bg-white text-gray-600 w-[24px] h-[24px] rounded-full flex justify-center items-center cursor-pointer",
        "transition-colors hover:bg-gray-200",
      ])}
    >
      <Icon icon={props.icon} class="text-[16px]" />
    </div>
  );
};

export default App;
