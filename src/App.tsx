import { onCleanup, onMount } from "solid-js";
import "./App.css";
import { invoke } from "@tauri-apps/api/core";
import FlipClock from "./flip-clock";

function App() {
  let timer: number;

  onMount(() => {
    // 设置番茄钟总时间：25分钟（以秒为单位）
    let totalSeconds = 25 * 60;
    const flipClock = new FlipClock();
    timer = setInterval(async () => {
      let minutes = Math.floor(totalSeconds / 60); // 获取分钟数
      let seconds = totalSeconds % 60; // 获取秒数

      flipClock.updateTime(minutes, seconds);
      // invoke tick command
      await invoke("tick", {});
      totalSeconds--;
      // 如果时间到达 0，重头开始
      if (totalSeconds < 0) {
        totalSeconds = 25 * 60; // 重置为 25 分钟
      }
    }, 1000);
  });

  onCleanup(() => {
    clearInterval(timer);
  });

  return (
    <main class="bg-black h-full flex flex-col justify-center items-center">
      <div class="clock-container">
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
    </main>
  );
}

export default App;
