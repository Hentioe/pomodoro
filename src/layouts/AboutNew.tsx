import { getVersion } from "@tauri-apps/api/app";
import { createResource } from "solid-js";

export default () => {
  const [version] = createResource(getVersion);

  return (
    <div class="flex flex-col gap-[1rem]">
      <p>
        本应用是由 <a href="https://github.com/Hentioe" target="_blank" class="text-sky-400">@Hentioe</a>{" "}
        开发的免费产品，通过 Tauri 框架为各个平台提供支持。
      </p>
      <p>
        更多内容请参考：
      </p>
      <ul>
        <li>
          -{" "}
          <a
            href="https://blog.hentioe.dev/posts/introduction-to-the-pomodoro-technique.html"
            target="_blank"
            class="text-green-400 underline"
          >
            入门番茄工作法
          </a>
        </li>
        <li>
          -{" "}
          <a
            href="https://blog.hentioe.dev/posts/pomodoro-clock-tauri-application-prospects.html"
            target="_blank"
            class="text-blue-400 underline"
          >
            番茄钟：Tauri 跨端应用开发前景的强大展现力
          </a>
        </li>
      </ul>
      <p class="text-center text-sm">
        软件版本：<span class="text-zinc-700o">{version()}</span>
      </p>
    </div>
  );
};
