import { Icon, IconifyIcon } from "@iconify-icon/solid";
import classNames from "classnames";
import { createSignal } from "solid-js";
import { PomodoroPhase } from "tauri-plugin-backend-api";
import { StandardDialog } from "../components";
import { SoundGridDialog } from "../dialogs";
import { useTranslator } from "../i18n";
import icons from "../icons";

interface Props {
  loaded: boolean;
  phase: PomodoroPhase;
  isPlaying: boolean;
  // 播放切换事件
  onTogglePlay: () => void;
  // 下一阶段事件
  onNext: () => void;
  // 重置事件
  onReset: () => void;
  // 退出事件
  onExit: () => Promise<boolean>;
}

export default (props: Props) => {
  const t = useTranslator();

  const [soundDialogOpen, setSoundDialogOpen] = createSignal(false);
  const [exitConfirmOpen, setExitConfirmOpen] = createSignal(false);

  const handleExit = async () => {
    if (props.isPlaying) {
      setExitConfirmOpen(true);
    } else {
      await props.onExit();
    }
  };

  // 番茄指示器
  const TomatoIndicator = () => {
    return (
      <div
        id="tomato-indicator"
        data-state={props.phase}
        onClick={props.onNext}
        class="h-full rounded-full flex justify-center white text-black items-center"
      >
        <Icon
          icon={icons.Tomato}
          style={{ filter: "drop-shadow(5px 5px 5px rgba(0, 0, 0, 0.25))" }}
          data-state={props.phase}
          class="w-[2.25rem] h-[2.25rem] text-[2.25rem] transition-colors duration-800"
        />
      </div>
    );
  };

  return (
    <>
      <div
        id="controls"
        class={classNames([
          "absolute bottom-[-3rem] z-10 h-[3.5rem] bg-digit-bg text-zinc-300 shadow-window rounded-[1.025rem] flex justify-center items-center px-[0.5rem]",
          { "bottom-[1rem]": props.loaded },
        ])}
      >
        <div class="flex items-center gap-[0.75rem]">
          <TomatoIndicator />
          <div class="w-[1px] h-[1.25rem] bg-zinc-600" />
        </div>
        <div class="flex items-center gap-[0.75rem] pl-[0.75rem]">
          <ControlButton icon={props.isPlaying ? icons.Pause : icons.Play} onClick={props.onTogglePlay} />
          <ControlButton icon={icons.Reset} onClick={props.onReset} />
          <ControlButton icon={icons.Music} onClick={() => setSoundDialogOpen(true)} />
          <ControlButton icon={icons.Close} onClick={handleExit} />
        </div>
      </div>
      {/* 声音定制弹窗 */}
      <SoundGridDialog open={soundDialogOpen} setOpen={setSoundDialogOpen} />
      {/* 退出确认弹窗 */}
      <StandardDialog
        title={t("dialog.controls.exit.title")}
        onConfirm={props.onExit}
        open={exitConfirmOpen}
        setOpen={setExitConfirmOpen}
      >
        {t("dialog.controls.exit.message")}
      </StandardDialog>
    </>
  );
};

const ControlButton = (props: { icon: string | IconifyIcon; onClick?: () => void }) => {
  const handleClick = () => {
    if (props.onClick) {
      props.onClick();
    }
  };

  return (
    <div
      onClick={handleClick}
      class="depress-effect w-[2.55rem] h-[2.55rem] bg-black text-digit-fg rounded-[1.025rem] flex justify-center items-center cursor-pointer"
    >
      <Icon icon={props.icon} class="w-[1.6rem] h-[1.6rem] text-[1.6rem]" />
    </div>
  );
};
