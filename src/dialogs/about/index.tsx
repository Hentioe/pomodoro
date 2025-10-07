import HentioeAvatar from "/src/assets/hentioe.webp";
import TauriLogo from "/src/assets/tauri.svg";
import { Icon, IconifyIcon } from "@iconify-icon/solid";
import { destructure } from "@solid-primitives/destructure";
import { getVersion } from "@tauri-apps/api/app";
import { error } from "@tauri-apps/plugin-log";
import classNames from "classnames";
import { Accessor, createResource, createSignal, JSX, Setter, Show } from "solid-js";
import { toast, WebViewInfo } from "tauri-plugin-backend-api";
import { BasicDialog } from "../../components";
import { useTranslator } from "../../i18n";
import icons from "../../icons";
import { globalState, setUpdate } from "../../states/global";
import { UpdateChecker } from "../../update-checker";
import NewVersionDialog from "../NewVersionDialog";

interface Props {
  open: Accessor<boolean>;
  setOpen: Setter<boolean>;
  onClose: () => void;
  webViewInfo?: WebViewInfo;
  updateChecker?: UpdateChecker;
}

export default (props: Props) => {
  const t = useTranslator();
  const [version] = createResource(getVersion);
  const [newVersionDialogOpen, setNewVersionDialogOpen] = createSignal(false);
  const [isUpdateChecking, setIsUpdateChecking] = createSignal(false);

  const { update } = destructure(globalState);

  const handleCheckUpdate = async () => {
    if (props.updateChecker && !isUpdateChecking()) {
      setIsUpdateChecking(true);
      await toast(t("update.checking"));
      try {
        const result = await props.updateChecker.checkCached();

        if (result.success) {
          if (result.payload.available) {
            setUpdate(result.payload);
            setNewVersionDialogOpen(true);
          } else {
            setNewVersionDialogOpen(false);
            await toast(t("update.latest"));
          }
        } else {
          await toast(t("update.error", { message: result.message }));
        }
      } catch (e) {
        if (e instanceof String) {
          error("Failed to check for updates: " + e);
        }
        await toast(t("update.failed"));
      }

      setIsUpdateChecking(false);
    }
  };

  const Header = () => {
    return (
      <div class="flex flex-col justify-center items-center gap-[0.5rem]">
        {/* 图标 */}
        <div class="w-[4.5rem] h-[4.5rem] bg-green-400 rounded-2xl shadow-md flex justify-center items-center">
          <Icon
            icon={icons.Tomato}
            style={{ filter: "drop-shadow(5px 5px 5px rgba(0, 0, 0, 0.25))" }}
            class="text-focus text-[3.5rem] w-[3.5rem] h-[3.5rem]"
          />
        </div>
        {/* 应用名称 */}
        <p class="font-bold text-[1.5rem]">{t("app.name")}</p>
        <p class="text-gray-600 text-sm tracking-wide">{t("app.description")}</p>
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
          {t("about.button.confirm")}
        </button>
      </div>
    );
  };

  const VersionButton = () => {
    return (
      <button
        onClick={handleCheckUpdate}
        class="depress-effect relative px-4 py-[0.15rem] bg-blue-400 text-white font-medium rounded-full"
      >
        {version() || t("about.unknown_value")}
        <Show when={update()}>
          <div class="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-500" />
        </Show>
      </button>
    );
  };

  return (
    <>
      <BasicDialog open={props.open} setOpen={props.setOpen} header={<Header />} footer={<Footer />}>
        <div class="bg-white p-[0.75rem] rounded-xl flex flex-col gap-[1rem]">
          <Field name={t("about.app_version")}>
            <VersionButton />
          </Field>
          <Field name="WebView">
            <FieldTextValue>{props.webViewInfo ? props.webViewInfo.version : t("about.unknown_value")}</FieldTextValue>
          </Field>
          <Field name={t("about.platform")}>
            <FieldTextValue>{props.webViewInfo ? props.webViewInfo.platform : t("about.unknown_value")}</FieldTextValue>
          </Field>
        </div>
        <div class="mt-[1rem] bg-white p-[0.75rem] rounded-xl flex flex-col gap-[1rem]">
          <p class="leading-[2rem] tracking-wide text-gray-700">
            {t("about.this_app_is")}
            <IconLink
              text="Hentioe"
              url="https://github.com/Hentioe"
              imgSrc={HentioeAvatar}
            />
            {t("about.developed_free_product")}
            <IconLink
              text="Tauri"
              url="https://tauri.app"
              imgSrc={TauriLogo}
            />
            {t("about.built_with_framework")}
          </p>
        </div>
        <div class="mt-[1rem]">
          <ul class="flex flex-col gap-[0.5rem]">
            <NavLink
              icon={icons.CheckFill}
              url="https://blog.hentioe.dev/posts/introduction-to-the-pomodoro-technique.html"
            >
              {t("about.refer.intro")}
            </NavLink>
            <NavLink
              icon={icons.DocumentTextBold}
              url="https://blog.hentioe.dev/posts/pomodoro-clock-tauri-application-prospects.html"
            >
              {t("about.refer.tauri")}
            </NavLink>
          </ul>
        </div>
      </BasicDialog>
      {/* 新版本弹窗 */}
      <NewVersionDialog open={newVersionDialogOpen} setOpen={setNewVersionDialogOpen} />
    </>
  );
};

const Field = (props: { name: string; children: JSX.Element }) => {
  return (
    <button class="flex items-center justify-between">
      <span class="text-zinc-600">{props.name}</span>
      {props.children}
    </button>
  );
};

const FieldTextValue = (props: { children: JSX.Element }) => {
  return <span class="text-zinc-700 font-medium">{props.children}</span>;
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
      class={classNames([
        "h-[1.5rem] bg-zinc-100/50 border border-zinc-200 text-blue-400 px-2 mx-[0.2rem] rounded-lg inline-flex items-center gap-[0.25rem] align-middle",
        "transition-colors active:bg-blue-200/90 active:border-blue-200",
      ])}
    >
      <img src={props.imgSrc} class="h-[1rem] w-[1rem] rounded-md" />
      <span>{props.text}</span>
    </a>
  );
};
