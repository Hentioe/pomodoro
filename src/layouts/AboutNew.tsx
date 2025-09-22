import HentioeAvatar from "/src/assets/hentioe.webp";
import { Icon } from "@iconify-icon/solid";
import { getVersion } from "@tauri-apps/api/app";
import { createResource, JSX } from "solid-js";

export default (props: { onClose: () => void }) => {
  const [version] = createResource(getVersion);

  return (
    <div class="flex flex-col gap-[1rem]">
      <div class="flex items-center gap-[1rem]">
        <div class="w-[3rem] h-[3rem] bg-green-500 rounded-2xl shadow flex justify-center items-center">
          <Icon icon="lets-icons:check-fill" class="text-white text-[2rem]" />
        </div>
        <span class="font-bold text-[1.5rem]">关于</span>
      </div>
      <p class="leading-[2rem] tracking-wide text-gray-600">
        本应用是由
        <a
          href="https://github.com/Hentioe"
          target="_blank"
          class="bg-sky-200/60 text-sky-500 px-2 rounded font-bold inline-flex items-center gap-[0.25rem] align-middle"
        >
          <img src={HentioeAvatar} class="h-[1rem] w-[1rem] rounded-md" />
          <span>Hentioe</span>
        </a>
        开发的免费产品，基于 Tauri 框架正在为各个平台提供支持。
      </p>
      <p class="text-center text-sm flex justify-between items-center bg-blue-100/70 rounded-2xl px-4 py-4">
        <span>软件版本</span>
        <span class="p-2 bg-white shadow text-blue-400 rounded-md border border-zinc-200">{version()}</span>
      </p>
      <p class="mt-[1rem] font-bold">
        更多内容请参考
      </p>
      <ul class="flex flex-col gap-[0.5rem]">
        <NavLink
          icon="lets-icons:check-fill"
          url="https://blog.hentioe.dev/posts/introduction-to-the-pomodoro-technique.html"
        >
          入门番茄工作法
        </NavLink>
        <NavLink
          icon="solar:document-text-bold"
          url="https://blog.hentioe.dev/posts/pomodoro-clock-tauri-application-prospects.html"
        >
          跨端应用开发前景的强大展现力
        </NavLink>
      </ul>
      <div class="mt-[1rem] text-center">
        <button
          class="px-[2.5rem] py-[0.75rem] bg-blue-400 text-white rounded-md shadow font-bold"
          onClick={props.onClose}
        >
          关闭
        </button>
      </div>
    </div>
  );
};

const NavLink = (props: { url: string; icon: string; children: JSX.Element }) => {
  return (
    <li>
      <a
        href={props.url}
        target="_blank"
        class="bg-blue-100/70 flex items-center gap-[1rem] p-[0.5rem] rounded-2xl"
      >
        <Icon icon={props.icon} class="text-blue-400 text-[1.5rem] w-[1.5rem]" />
        <p class="text-gray-600">{props.children}</p>
      </a>
    </li>
  );
};
