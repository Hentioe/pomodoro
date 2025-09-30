import { Accessor, onMount, Setter } from "solid-js";
import { createStore } from "solid-js/store";
import { onSettingsUpdated, ping, writeSettings } from "tauri-plugin-backend-api";
import { StandardDialog } from "../components";
import Slider from "../components/Slider";

interface Props {
  open: Accessor<boolean>;
  setOpen: Setter<boolean>;
}

interface Times {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
}

const DEFAULT_FOCUS_MINUTES = 25;
const DEFAULT_BREAK_MINUTES = 5;
const DEFAULT_LONG_BREAK_MINUTES = 15;

const DEFAULT_TIMES: Times = {
  focusMinutes: DEFAULT_FOCUS_MINUTES,
  shortBreakMinutes: DEFAULT_BREAK_MINUTES,
  longBreakMinutes: DEFAULT_LONG_BREAK_MINUTES,
};

export default (props: Props) => {
  const [editingTimes, setEditingTimes] = createStore<Times>(structuredClone(DEFAULT_TIMES));
  const [submittedTimes, setSubmittedTimes] = createStore<Times>(structuredClone(DEFAULT_TIMES));

  const handleConfirm = async () => {
    if (editingTimes.focusMinutes !== submittedTimes.focusMinutes) {
      await writeSettings({
        focusMinutes: editingTimes.focusMinutes,
        shortBreakMinutes: editingTimes.shortBreakMinutes,
        longBreakMinutes: editingTimes.longBreakMinutes,
      });
    }

    // 请求推送修改后的状态
    await ping("--push=state");

    return true;
  };

  const handleCancel = () => {
    setEditingTimes(submittedTimes);
  };

  onMount(async () => {
    await onSettingsUpdated((settings) => {
      if (settings.focusMinutes != null) {
        setEditingTimes("focusMinutes", settings.focusMinutes);
        setSubmittedTimes("focusMinutes", settings.focusMinutes);
      }
      if (settings.shortBreakMinutes != null) {
        setEditingTimes("shortBreakMinutes", settings.shortBreakMinutes);
        setSubmittedTimes("shortBreakMinutes", settings.shortBreakMinutes);
      }
      if (settings.longBreakMinutes != null) {
        setEditingTimes("longBreakMinutes", settings.longBreakMinutes);
        setSubmittedTimes("longBreakMinutes", settings.longBreakMinutes);
      }
    });

    await ping("--push=settings");
  });

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
          label={"专注时长：" + editingTimes.focusMinutes + " 分钟"}
          value={editingTimes.focusMinutes}
          min={15}
          max={35}
          step={1}
          onValueChange={(value) => setEditingTimes("focusMinutes", value)}
        />
        <Slider
          label={"短休息时长：" + editingTimes.shortBreakMinutes + " 分钟"}
          value={editingTimes.shortBreakMinutes}
          min={3}
          max={10}
          step={1}
          onValueChange={(value) => setEditingTimes("shortBreakMinutes", value)}
        />
        <Slider
          label={"长休息时长：" + editingTimes.longBreakMinutes + " 分钟"}
          value={editingTimes.longBreakMinutes}
          min={10}
          max={20}
          step={1}
          onValueChange={(value) => setEditingTimes("longBreakMinutes", value)}
        />
      </div>
    </StandardDialog>
  );
};
