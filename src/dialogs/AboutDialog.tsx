import HentioeAvatar from "/src/assets/hentioe.webp";
import TauriLogo from "/src/assets/tauri.svg";
import { Icon, IconifyIcon } from "@iconify-icon/solid";
import { getVersion } from "@tauri-apps/api/app";
import { Accessor, createResource, createSignal, JSX, Setter } from "solid-js";
import { toast } from "tauri-plugin-backend-api";
import { BasicDialog } from "../components";
import icons from "../icons";
import NewVersionDialog from "../layouts/NewVersionDialog";
import { UpdateChecker } from "../update-checker";

interface Props {
  open: Accessor<boolean>;
  setOpen: Setter<boolean>;
  onClose: () => void;
  updateChecker?: UpdateChecker;
}

export default (props: Props) => {
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

  const Header = () => {
    return (
      <div class="flex items-center gap-[1rem]">
        <div class="w-[3rem] h-[3rem] bg-green-400 rounded-2xl shadow flex justify-center items-center">
          <Icon
            icon={icons.Tomato}
            style={{ filter: "drop-shadow(5px 5px 5px rgba(0, 0, 0, 0.25))" }}
            class="text-focus text-[2rem]"
          />
        </div>
        <span class="font-bold text-[1.5rem]">关于</span>
      </div>
    );
  };

  const Footer = () => {
    return (
      <div class="text-center">
        <button
          class="text-blue-400 font-bold"
          onClick={props.onClose}
        >
          确认
        </button>
      </div>
    );
  };

  return (
    <>
      <BasicDialog open={props.open} setOpen={props.setOpen} header={<Header />} footer={<Footer />}>
        <div class="flex flex-col gap-[1rem]">
          <p class="leading-[2rem] tracking-wide text-gray-800">
            本应用是由<IconLink
              text="Hentioe"
              url="https://github.com/Hentioe"
              imgSrc={HentioeAvatar}
            />开发的免费产品，基于<IconLink
              text="Tauri"
              url="https://tauri.app"
              imgSrc={TauriLogo}
            />框架构建，正在为大量平台提供支持。
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
        </div>
      </BasicDialog>
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

const IconLink = (props: { text: string; url: string; imgSrc: string }) => {
  return (
    <a
      href={props.url}
      target="_blank"
      class="bg-zinc-200/70 active:bg-blue-200/90 h-[1.5rem] transition-colors border border-zinc-200 text-blue-400 px-2 mx-[0.2rem] rounded-lg inline-flex items-center gap-[0.25rem] align-middle"
    >
      <img src={props.imgSrc} class="h-[1rem] w-[1rem] rounded-md" />
      <span>{props.text}</span>
    </a>
  );
};
