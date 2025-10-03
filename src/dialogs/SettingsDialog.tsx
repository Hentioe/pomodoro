import { Icon, IconifyIcon } from "@iconify-icon/solid";
import { Accessor, JSX, onMount, Setter } from "solid-js";
import { createStore } from "solid-js/store";
import { DefaultName, onSettingsUpdated, ping, previewSound, Settings, writeSettings } from "tauri-plugin-backend-api";
import { BasicDialog } from "../components";
import CloseableTitleBar from "../components/CloseableTitleBar";
import Slider, { SliderProps } from "../components/Slider";
import { proxyTranslator } from "../i18n";
import icons from "../icons";

type Volumes = {
  [key in DefaultName]: number;
};

interface Times {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
}

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

const DEFAULT_FOCUS_MINUTES = 25;
const DEFAULT_BREAK_MINUTES = 5;
const DEFAULT_LONG_BREAK_MINUTES = 15;
const DEFAULT_TIMES: Times = {
  focusMinutes: DEFAULT_FOCUS_MINUTES,
  shortBreakMinutes: DEFAULT_BREAK_MINUTES,
  longBreakMinutes: DEFAULT_LONG_BREAK_MINUTES,
};

interface Props {
  open: Accessor<boolean>;
  setOpen: Setter<boolean>;
}

export default (props: Props) => {
  const t = proxyTranslator();
  const [editingVolumes, setEditingVolumes] = createStore<Volumes>(structuredClone(DEFAULT_VOLUMS));
  const [editingTimes, setEditingTimes] = createStore<Times>(structuredClone(DEFAULT_TIMES));
  const [submittedVolumes, setSubmittedVolumes] = createStore<Volumes>(structuredClone(DEFAULT_VOLUMS));
  const [submittedTimes, setSubmittedTimes] = createStore<Times>(structuredClone(DEFAULT_TIMES));

  const handleChange = async (type: DefaultName, value: number) => {
    setEditingVolumes(type, value);
    // 预览当前大小的声音
    await previewSound(type, value);
  };

  const handleSave = async () => {
    const changeset: Settings = {
      tickVolume: editingVolumes.tick_default,
      alarmVolume: editingVolumes.alarm_default,
      promptVolume: editingVolumes.prompt_default,
      backgroundVolume: editingVolumes.background_default,
    };

    // 仅在时长设置有变更时才更新，避免不必要的计时器重置
    if (editingTimes.focusMinutes !== submittedTimes.focusMinutes) {
      changeset.focusMinutes = editingTimes.focusMinutes;
    }
    if (editingTimes.shortBreakMinutes !== submittedTimes.shortBreakMinutes) {
      changeset.shortBreakMinutes = editingTimes.shortBreakMinutes;
    }
    if (editingTimes.longBreakMinutes !== submittedTimes.longBreakMinutes) {
      changeset.longBreakMinutes = editingTimes.longBreakMinutes;
    }

    await writeSettings(changeset);

    props.setOpen(false);

    await ping("--push=state");
  };

  const handleCancel = () => {
    setEditingVolumes("tick_default", submittedVolumes.tick_default);
    setEditingVolumes("alarm_default", submittedVolumes.alarm_default);
    setEditingVolumes("prompt_default", submittedVolumes.prompt_default);
    setEditingVolumes("background_default", submittedVolumes.background_default);
    setEditingTimes(submittedTimes);
  };

  onMount(async () => {
    await onSettingsUpdated((settings) => {
      if (settings.tickVolume != null) {
        setEditingVolumes("tick_default", settings.tickVolume);
        setSubmittedVolumes("tick_default", settings.tickVolume);
      }
      if (settings.alarmVolume != null) {
        setEditingVolumes("alarm_default", settings.alarmVolume);
        setSubmittedVolumes("alarm_default", settings.alarmVolume);
      }
      if (settings.promptVolume != null) {
        setEditingVolumes("prompt_default", settings.promptVolume);
        setSubmittedVolumes("prompt_default", settings.promptVolume);
      }
      if (settings.backgroundVolume != null) {
        setEditingVolumes("background_default", settings.backgroundVolume);
        setSubmittedVolumes("background_default", settings.backgroundVolume);
      }
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

  const Footer = () => {
    return (
      <div class=" flex items-center gap-[0.5rem]">
        {
          /* <button class="flex-1 bg-gray-200 text-gray-800 py-[0.5rem] rounded-xl">
          {t.settings.button.reset()}
        </button> */
        }
        <button onClick={handleSave} class="flex-1 bg-blue-500 text-white py-[0.5rem] rounded-xl">
          {t.settings.button.save()}
        </button>
      </div>
    );
  };

  return (
    <BasicDialog
      open={props.open}
      setOpen={props.setOpen}
      header={<CloseableTitleBar title={t.settings.title()} setOpen={props.setOpen} onClose={handleCancel} />}
      footer={<Footer />}
    >
      <CategoryTitle>{t.settings.timer()}</CategoryTitle>
      <div class="flex flex-col gap-[2rem]">
        <MySlider
          icon={icons.WorkingSpaceLaptop}
          label={
            <SliderLabel
              name={t.settings.focus_duration()}
              value={editingTimes.focusMinutes + " " + t.settings.minutes()}
            />
          }
          value={editingTimes.focusMinutes}
          min={15}
          max={35}
          step={1}
          onValueChange={(value) => setEditingTimes("focusMinutes", value)}
        />
        <MySlider
          icon={icons.UserPause}
          label={
            <SliderLabel
              name={t.settings.short_break_duration()}
              value={editingTimes.shortBreakMinutes + " " + t.settings.minutes()}
            />
          }
          value={editingTimes.shortBreakMinutes}
          min={3}
          max={10}
          step={1}
          onValueChange={(value) => setEditingTimes("shortBreakMinutes", value)}
        />
        <MySlider
          icon={icons.Spa}
          label={
            <SliderLabel
              name={t.settings.long_break_duration()}
              value={editingTimes.longBreakMinutes + " " + t.settings.minutes()}
            />
          }
          value={editingTimes.longBreakMinutes}
          min={10}
          max={20}
          step={1}
          onValueChange={(value) => setEditingTimes("longBreakMinutes", value)}
        />
      </div>
      <div class="mt-[0.75rem]" />
      <CategoryTitle>{t.settings.volume()}</CategoryTitle>
      <div class="flex flex-col gap-[2rem]">
        <MySlider
          icon={icons.Time}
          label={<SliderLabel name={t.settings.tick_sound()} value={editingVolumes.tick_default} />}
          value={editingVolumes.tick_default}
          onValueChangeEnd={(v) => handleChange("tick_default", v)}
        />
        <MySlider
          icon={icons.Alarm}
          label={<SliderLabel name={t.settings.alarm_sound()} value={editingVolumes.alarm_default} />}
          value={editingVolumes.alarm_default}
          onValueChangeEnd={(v) => handleChange("alarm_default", v)}
        />
        <MySlider
          icon={icons.Alert}
          label={<SliderLabel name={t.settings.prompt_sound()} value={editingVolumes.prompt_default} />}
          value={editingVolumes.prompt_default}
          onValueChangeEnd={(v) => handleChange("prompt_default", v)}
        />
        <MySlider
          icon={icons.MusicVolume}
          label={<SliderLabel name={t.settings.background_sound()} value={editingVolumes.background_default} />}
          value={editingVolumes.background_default}
          onValueChangeEnd={(v) => handleChange("background_default", v)}
        />
      </div>
    </BasicDialog>
  );
};

const SliderLabel = (props: { name: string; value: number | string }) => {
  return (
    <div class="flex justify-between w-full">
      <span>{props.name}</span>
      <span class="text-zinc-600">{props.value}</span>
    </div>
  );
};

const MySlider = (props: SliderProps & { icon: string | IconifyIcon }) => {
  return (
    <div class="px-[0.5rem] flex items-center gap-[1rem]">
      <Icon icon={props.icon} class="text-[1.5rem] w-[1.5rem] h-[1.5rem]" />

      <div class="flex-1">
        <Slider
          label={props.label}
          value={props.value}
          min={props.min}
          max={props.max}
          step={props.step}
          onValueChange={props.onValueChange}
          onValueChangeEnd={props.onValueChangeEnd}
        />
      </div>
    </div>
  );
};

const CategoryTitle = (props: { children: JSX.Element }) => {
  return <p class="text-[1.05rem] mb-[1rem] tracking-wide">{props.children}</p>;
};
