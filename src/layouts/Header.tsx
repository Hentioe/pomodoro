import { Icon, IconifyIcon } from "@iconify-icon/solid";
import { destructure } from "@solid-primitives/destructure";
import { info } from "@tauri-apps/plugin-log";
import { createSignal, onMount, Show } from "solid-js";
import { onWebViewInfoFetched, ping, WebViewInfo } from "tauri-plugin-backend-api";
import { AboutDialog, TodoDialog } from "../dialogs";
import SettingsDialog from "../dialogs/SettingsDialog";
import { isMobile } from "../helper";
import { useTranslator } from "../i18n";
import icons from "../icons";
import { globalState } from "../states/global";
import { UpdateChecker } from "../update-checker";

export default (props: { updateChecker?: UpdateChecker }) => {
  const t = useTranslator();

  const [settingsDialogOpen, setSettingsDialogOpen] = createSignal(false);
  const [todoDialogOpen, setTodoDialogOpen] = createSignal(false);
  const [aboutNewDialogOpen, setAboutNewDialogOpen] = createSignal(false);
  const [webviewInfo, setWebviewInfo] = createSignal<WebViewInfo | undefined>(undefined);

  const { update } = destructure(globalState);

  const NoTodo = () => {
    return (
      <button onClick={() => setTodoDialogOpen(true)} class="bg-white text-black text-base rounded-lg px-[0.5rem]">
        {t("header.todo_manage")}
      </button>
    );
  };

  const handleWebViewInfoFetched = (webviewInfo: WebViewInfo) => {
    info("WebView version: " + webviewInfo.version);
    setWebviewInfo(webviewInfo);
  };

  onMount(async () => {
    if (isMobile) {
      await onWebViewInfoFetched(handleWebViewInfoFetched);
      await ping("--push=webview");
    }
  });

  return (
    <>
      <header class="absolute top-[1rem] left-[1rem] right-[1rem] text-zinc-200 flex justify-between items-center">
        <div class="flex-1">
          <NavIcon icon={update() ? icons.AboutNew : icons.About} onClick={() => setAboutNewDialogOpen(true)} />
        </div>
        <Show when={false} fallback={<NoTodo />}>
          Focus on: Todo Item
        </Show>
        <div class="flex-1 flex gap-[1rem] items-center justify-end">
          <NavIcon icon={icons.Setting} onClick={() => setSettingsDialogOpen(true)} />
        </div>
      </header>
      {/* 设置弹窗 */}
      <SettingsDialog open={settingsDialogOpen} setOpen={setSettingsDialogOpen} />
      {/* Todo 弹窗 */}
      <TodoDialog open={todoDialogOpen} setOpen={setTodoDialogOpen} />
      {/* 关于弹窗 */}
      <AboutDialog
        open={aboutNewDialogOpen}
        setOpen={setAboutNewDialogOpen}
        onClose={() => setAboutNewDialogOpen(false)}
        updateChecker={props.updateChecker}
        webViewInfo={webviewInfo()}
      />
    </>
  );
};

const NavIcon = (props: { icon: string | IconifyIcon; onClick?: () => void }) => {
  return <Icon icon={props.icon} onClick={props.onClick} class="text-[1.5rem] h-[1.5rem] w-[1.5rem]" />;
};
