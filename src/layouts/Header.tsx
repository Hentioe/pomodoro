import { Icon, IconifyIcon } from "@iconify-icon/solid";
import { info } from "@tauri-apps/plugin-log";
import { createSignal, onMount, Show } from "solid-js";
import { onWebViewInfoFetched, ping, WebViewInfo } from "tauri-plugin-backend-api";
import AboutDialog from "../dialogs/AboutDialog";
import NewVersionDialog from "../dialogs/NewVersionDialog";
import SoundDialog from "../dialogs/SoundDialog";
import TimerDialog from "../dialogs/TimerDialog";
import VolumeDialog from "../dialogs/VolumeDialog";
import { isMobile } from "../helper";
import icons from "../icons";
import { UpdateChecker } from "../update-checker";

export default (props: { update?: Update; updateChecker?: UpdateChecker }) => {
  const [soundDialogOpen, setSoundDialogOpen] = createSignal(false);
  const [volumeDialogOpen, setVolumeDialogOpen] = createSignal(false);
  const [newVersionDialogOpen, setNewVersionDialogOpen] = createSignal(false);
  const [aboutNewDialogOpen, setAboutNewDialogOpen] = createSignal(false);
  const [timerDialogOpen, setTimerDialogOpen] = createSignal(false);
  const [webviewInfo, setWebviewInfo] = createSignal<WebViewInfo | undefined>(undefined);

  const Version = () => {
    return <p class="bg-white text-black text-base rounded-lg px-[0.5rem]">开发版</p>;
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
          <NavIcon icon={icons.AboutNew} onClick={() => setAboutNewDialogOpen(true)} />
        </div>
        <Show when={props.update} fallback={<Version />}>
          <p
            onClick={() => setNewVersionDialogOpen(true)}
            class="bg-red-500 text-zinc-100 text-base rounded-lg px-[0.5rem] cursor-pointer"
          >
            发现新版本
          </p>
        </Show>
        <div class="flex-1 flex gap-[1rem] items-center justify-end">
          <NavIcon icon={icons.Timer} onClick={() => setTimerDialogOpen(true)} />
          <NavIcon icon={icons.Music} onClick={() => setSoundDialogOpen(true)} />
          <NavIcon icon={icons.Volume} onClick={() => setVolumeDialogOpen(true)} />
        </div>
      </header>
      {/* 声音设置弹窗 */}
      <SoundDialog open={soundDialogOpen} setOpen={setSoundDialogOpen} />
      {/* 音量设置弹窗 */}
      <VolumeDialog open={volumeDialogOpen} setOpen={setVolumeDialogOpen} />
      {/* 定时器设置弹窗 */}
      <TimerDialog open={timerDialogOpen} setOpen={setTimerDialogOpen} />
      {/* 新版本弹窗 */}
      <NewVersionDialog open={newVersionDialogOpen} setOpen={setNewVersionDialogOpen} update={props.update} />
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
