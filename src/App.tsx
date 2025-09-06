import { invoke } from "@tauri-apps/api/core";
import { createSignal } from "solid-js";
import "./App.css";

function App() {
  const [greetMsg, setGreetMsg] = createSignal("");
  const [name, setName] = createSignal("鸽鸽");

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name: name() }));
  }

  return (
    <main class="h-full flex flex-col justify-center items-center">
      <h1 class="text-center text-4xl font-bold">Welcome to Tauri + Solid + Tailwind CSS</h1>
      <p class="mt-[1rem]">{greetMsg() || "你好，你叫什么名字？"}</p>
      <div class="mt-[1rem]">
        <div class="flex gap-[1rem]">
          <input
            value={name()}
            type="text"
            placeholder="输入名字"
            onChange={(e) => setName(e.target.value)}
            class="outline-2 outline-zinc-200 hover:outline-blue-200 rounded-md text-center py-1"
          />
          <button onClick={greet} class="px-[2rem] py-2 bg-blue-500 text-white rounded-xl cursor-pointer">确认</button>
        </div>
      </div>
    </main>
  );
}

export default App;
