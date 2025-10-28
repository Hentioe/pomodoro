import { Icon, IconifyIcon } from "@iconify-icon/solid";
import { Match, Setter, Switch } from "solid-js";
import icons from "../icons";

export enum ControlButton {
  None,
  Back,
  Close,
  Add,
}
// ControlButton 到 Icon 的映射
const ControlIconMap: Record<ControlButton, IconifyIcon | string> = {
  [ControlButton.None]: "",
  [ControlButton.Back]: icons.DialogBack,
  [ControlButton.Close]: icons.DialogClose2,
  [ControlButton.Add]: icons.DialogAdd,
};

interface Props {
  title: string;
  leftButton: ControlButton;
  rightButton: ControlButton;
  setOpen: Setter<boolean>;
  onClose?: VoidFunction;
  onBack?: VoidFunction;
  onAdd?: VoidFunction;
}

export default (props: Props) => {
  const handleAction = (icon: ControlButton) => {
    switch (icon) {
      case ControlButton.Close:
        props.setOpen(false);
        props.onClose?.();
        break;
      case ControlButton.Back:
        props.onBack?.();
        break;

      case ControlButton.Add:
        props.onAdd?.();
        break;

      default:
        break;
    }
  };

  return (
    <div class="flex justify-between">
      <IconBox button={props.leftButton} onClick={handleAction} />
      <p class="text-center text-xl font-medium">{props.title}</p>
      <IconBox button={props.rightButton} onClick={handleAction} />
    </div>
  );
};

const IconBox = (props: { button: ControlButton; onClick: (icon: ControlButton) => void }) => {
  return (
    <Switch>
      <Match when={props.button === ControlButton.None}>
        <div class="w-[1.5rem]" />
      </Match>
      <Match when={true}>
        <div
          onClick={() => props.onClick(props.button)}
          class="w-[1.5rem] h-[1.5rem] bg-zinc-300/50 rounded-full flex justify-center items-center"
        >
          <Icon
            icon={ControlIconMap[props.button]}
            class="w-[1rem] h-[1rem] text-[1rem] cursor-pointer hover:text-zinc-500"
          />
        </div>
      </Match>
    </Switch>
  );
};
