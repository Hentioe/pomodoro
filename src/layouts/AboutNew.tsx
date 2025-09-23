import HentioeAvatar from "/src/assets/hentioe.webp";
import { Icon, IconifyIcon } from "@iconify-icon/solid";
import { getVersion } from "@tauri-apps/api/app";
import { createResource, createSignal, JSX } from "solid-js";
import { toast } from "tauri-plugin-backend-api";
import icons from "../icons";
import { UpdateChecker } from "../update-checker";
import NewVersionDialog from "./NewVersionDialog";

export default (props: { onClose: () => void; updateChecker?: UpdateChecker }) => {
  const [version] = createResource(getVersion);
  const [update, setUpdate] = createSignal<Update | undefined>(undefined);
  const [newVersionDialogOpen, setNewVersionDialogOpen] = createSignal(false);
  const [isUpdateChecking, setIsUpdateChecking] = createSignal(false);

  const handleCheckUpdate = async () => {
    if (props.updateChecker && !isUpdateChecking()) {
      setIsUpdateChecking(true);
      await toast("正在检查更新...");
      const result = await props.updateChecker.checkCached();
      setIsUpdateChecking(false);

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
            <Icon
              icon={icons.Tomato}
              style={{ filter: "drop-shadow(5px 5px 5px rgba(0, 0, 0, 0.25))" }}
              class="text-focus text-[2rem]"
            />
          </div>
          <span class="font-bold text-[1.5rem]">关于</span>
        </div>
        <p class="leading-[2rem] tracking-wide text-gray-800">
          本应用是由
          <a
            href="https://github.com/Hentioe"
            target="_blank"
            class="bg-zinc-200/70 active:bg-blue-200/90 transition-colors border border-zinc-200 text-blue-500 px-2 mx-1 rounded-xl inline-flex items-center gap-[0.25rem] align-middle"
          >
            <img src={HentioeAvatar} class="h-[1rem] w-[1rem] rounded-md" />
            <span>Hentioe</span>
          </a>
          开发的免费产品，基于 Tauri 框架，正在为大量平台提供支持。
        </p>
        <p class="text-center text-sm flex justify-between items-center bg-blue-100/70 rounded-2xl px-4 py-4">
          <span class="text-[1.1rem] text-gray-600">软件版本</span>
          <button
            onClick={handleCheckUpdate}
            class="depress-effect p-2 bg-white text-blue-400 rounded-md border border-zinc-200"
          >
            {version()}
          </button>
        </p>
        <p class="mt-[1rem] font-bold text-gray-700">
          更多内容请参考
        </p>
        <ul class="flex flex-col gap-[0.5rem]">
          <NavLink
            icon={icons.CheckFill}
            url="https://blog.hentioe.dev/posts/introduction-to-the-pomodoro-technique.html"
          >
            入门番茄工作法
          </NavLink>
          <NavLink
            icon={icons.DocumentTextBold}
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

const NavLink = (props: { url: string; icon: string | IconifyIcon; children: JSX.Element }) => {
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
