import { Accessor, onMount, Setter } from "solid-js";
import { createStore } from "solid-js/store";
import { onSettingsUpdated, ping, previewSound, SoundDefaultName, writeSettings } from "tauri-plugin-backend-api";
import { StandardDialog } from "../components";
import Slider from "../components/Slider";

type Volumes = {
  [key in SoundDefaultName]: number;
};

const DEFAULT_TICK_VOLUME = 0.5;
const DEFAULT_ALARM_VOLUME = 0.8;
const DEFAULT_PROMPT_VOLUME = 0.8;
const DEFAULT_BACKGROUND_VOLUME = 0.6;
const DEFAULT_VOLUMS = {
  tick_default: DEFAULT_TICK_VOLUME,
  alarm_default: DEFAULT_ALARM_VOLUME,
  prompt_default: DEFAULT_PROMPT_VOLUME,
  background_default: DEFAULT_BACKGROUND_VOLUME,
};

interface Props {
  open: Accessor<boolean>;
  setOpen: Setter<boolean>;
}

export default (props: Props) => {
  const [editing, setEditing] = createStore<Volumes>(structuredClone(DEFAULT_VOLUMS));
  const [submitted, setSubmitted] = createStore<Volumes>(structuredClone(DEFAULT_VOLUMS));

  const handleChange = (type: SoundDefaultName, value: number) => {
    setEditing(type, value);
    // 预览当前大小的声音
    previewSound(type, value);
  };

  const handleConfirm = async () => {
    await writeSettings({
      tickVolume: editing.tick_default,
      alarmVolume: editing.alarm_default,
      promptVolume: editing.prompt_default,
      backgroundVolume: editing.background_default,
    });

    return true;
  };

  const handleCancel = () => {
    setEditing("tick_default", submitted.tick_default);
    setEditing("alarm_default", submitted.alarm_default);
    setEditing("prompt_default", submitted.prompt_default);
    setEditing("background_default", submitted.background_default);
  };

  onMount(async () => {
    await onSettingsUpdated((settings) => {
      if (settings.tickVolume != null) {
        setEditing("tick_default", settings.tickVolume);
        setSubmitted("tick_default", settings.tickVolume);
      }
      if (settings.alarmVolume != null) {
        setEditing("alarm_default", settings.alarmVolume);
        setSubmitted("alarm_default", settings.alarmVolume);
      }
      if (settings.promptVolume != null) {
        setEditing("prompt_default", settings.promptVolume);
        setSubmitted("prompt_default", settings.promptVolume);
      }
      if (settings.backgroundVolume != null) {
        setEditing("background_default", settings.backgroundVolume);
        setSubmitted("background_default", settings.backgroundVolume);
      }
    });

    await ping("--push=settings");
  });

  return (
    <StandardDialog
      title="音量大小"
      open={props.open}
      setOpen={props.setOpen}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    >
      <div class="flex flex-col gap-[1rem]">
        <Slider
          label="滴答音"
          value={editing.tick_default}
          onValueChangeEnd={(v) => handleChange("tick_default", v)}
        />
        <Slider
          label="闹铃音"
          value={editing.alarm_default}
          onValueChangeEnd={(v) => handleChange("alarm_default", v)}
        />
        <Slider
          label="提示音"
          value={editing.prompt_default}
          onValueChangeEnd={(v) => handleChange("prompt_default", v)}
        />
        {
          <Slider
            label="背景音"
            value={editing.background_default}
            onValueChangeEnd={(v) => handleChange("background_default", v)}
          />
        }
      </div>
    </StandardDialog>
  );
};
