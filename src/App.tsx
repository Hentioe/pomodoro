import { createSignal, onCleanup, onMount } from "solid-js";
import "./App.css";
import { Icon } from "@iconify-icon/solid";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import classNames from "classnames";
import FlipClock from "./flip-clock";

const appWindow = getCurrentWindow();

function App() {
  const [isPlaying, setIsPlaying] = createSignal(false);
  const [totalSeconds, setTotalSeconds] = createSignal(25 * 60); // 25分钟的秒数

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
    setTotalSeconds(25 * 60);
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
    // 如果时间到达 0，重头开始
    if (totalSeconds() < 0) {
      setTotalSeconds(25 * 60); // 重置为 25 分钟
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
    play();
    dragEl?.addEventListener("mousedown", dragEvent);
  });

  onCleanup(() => {
    clearInterval(timer);
    dragEl?.removeEventListener("mousedown", dragEvent);
  });

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

      <div class="mt-[20px] h-[40px] bg-gray-600 text-zinc-300 shadow-window flex justify-center items-center rounded-full gap-[20px] px-[20px]">
        <ControlButton onClick={handleTogglePlay} icon={isPlaying() ? "mingcute:pause-fill" : "mingcute:play-fill"} />
        <ControlButton onClick={restart} icon="ix:restore" />
        <ControlButton onClick={handleExit} icon="noto-v1:cross-mark" />
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
