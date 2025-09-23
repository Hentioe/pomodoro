import { Accessor, createSignal, Setter } from "solid-js";
import { StandardDialog } from "../components";
import Slider from "../components/Slider";

interface Props {
  open: Accessor<boolean>;
  setOpen: Setter<boolean>;
}

export default (props: Props) => {
  const [focusMinutes, setFocusMinutes] = createSignal(25);
  const [breakMinutes, setBreakMinutes] = createSignal(5);
  const [longBreakMinutes, setLongBreakMinutes] = createSignal(15);

  const handleConfirm = async () => {
    return true;
  };

  const handleCancel = () => {};

  return (
    <StandardDialog
      title="定时器调整"
      open={props.open}
      setOpen={props.setOpen}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    >
      <div class="flex flex-col gap-[1rem]">
        <Slider
          label={"专注时长：" + focusMinutes() + " 分钟"}
          value={focusMinutes()}
          min={15}
          max={35}
          step={1}
          onValueChange={setFocusMinutes}
        />
        <Slider
          label={"短休息时长：" + breakMinutes() + " 分钟"}
          value={breakMinutes()}
          min={3}
          max={10}
          step={1}
          onValueChange={setBreakMinutes}
        />
        <Slider
          label={"长休息时长：" + longBreakMinutes() + " 分钟"}
          value={longBreakMinutes()}
          min={10}
          max={20}
          step={1}
          onValueChange={setLongBreakMinutes}
        />
      </div>
    </StandardDialog>
  );
};
