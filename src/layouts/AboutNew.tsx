import HentioeAvatar from "/src/assets/hentioe.webp";
import { Icon } from "@iconify-icon/solid";
import { getVersion } from "@tauri-apps/api/app";
import { createResource, createSignal, JSX } from "solid-js";
import { toast } from "tauri-plugin-backend-api";
import { UpdateChecker } from "../update-checker";
import NewVersionDialog from "./NewVersionDialog";

export default (props: { onClose: () => void; updateChecker?: UpdateChecker }) => {
  const [version] = createResource(getVersion);
  const [update, setUpdate] = createSignal<Update | undefined>(undefined);
  const [newVersionDialogOpen, setNewVersionDialogOpen] = createSignal(false);

  const handleCheckUpdate = async () => {
    const checker = props.updateChecker;
    if (checker) {
      const result = await checker.checkCached();

      if (result.success) {
        if (result.payload.available) {
          setUpdate(result.payload);
          setNewVersionDialogOpen(true);
        } else {
          setNewVersionDialogOpen(false);
          await toast("当前已是最新版本");
        }
      } else {
        await toast("检查更新失败: " + result.message);
      }
    }
  };

  return (
    <>
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
          <span onClick={handleCheckUpdate} class="p-2 bg-white shadow text-blue-400 rounded-md border border-zinc-200">
            {version()}
          </span>
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
            class="text-blue-400 font-bold"
            onClick={props.onClose}
          >
            确认
          </button>
        </div>
      </div>
      {/* 新版本弹窗 */}
      <NewVersionDialog open={newVersionDialogOpen} setOpen={setNewVersionDialogOpen} update={update()} />
    </>
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
