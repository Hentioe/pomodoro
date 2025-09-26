import { Icon, IconifyIcon } from "@iconify-icon/solid";
import classNames from "classnames";
import { createSignal } from "solid-js";
import { PomodoroPhase } from "tauri-plugin-backend-api";
import { StandardDialog } from "../components";
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
        class={classNames([
          "absolute bottom-[-3.5rem] z-10 h-[3.5rem] bg-digit-bg text-zinc-300 shadow-window rounded-full flex justify-center items-center px-[1rem]",
          "transition-all duration-700",
          { "bottom-[2rem]": props.loaded },
        ])}
      >
        <div class="flex items-center gap-[1.25rem]">
          <TomatoIndicator />
          <div class="w-[1px] h-[1.25rem] bg-zinc-600" />
        </div>
        <div class="flex items-center gap-[1.25rem] pl-[1.25rem]">
          <ControlButton onClick={props.onTogglePlay} icon={props.isPlaying ? icons.Pause : icons.Play} />
          <ControlButton onClick={props.onReset} icon={icons.Reset} />
          <ControlButton onClick={handleExit} icon={icons.Close} />
        </div>
      </div>
      <StandardDialog title="退出确认" onConfirm={props.onExit} open={exitConfirmOpen} setOpen={setExitConfirmOpen}>
        番茄钟还在计时中，确定要退出吗？
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
      class="control-btn w-[2rem] h-[2rem] text-gray-600 rounded-full flex justify-center items-center cursor-pointer"
    >
      <Icon icon={props.icon} class="w-[1.25rem] h-[1.25rem] text-[1.25rem]" />
    </div>
  );
};
