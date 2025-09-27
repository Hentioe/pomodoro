import { Accessor, createSignal, onMount, Setter } from "solid-js";
import { MusicName, onSettingsUpdated, ping, previewSound, TickName, writeSettings } from "tauri-plugin-backend-api";
import { StandardDialog } from "../components";
import Rodio from "../components/Rodio";

interface Props {
  open: Accessor<boolean>;
  setOpen: Setter<boolean>;
}

const DEFAULT_TICK_SOUND: TickName = "default_tick";
const DEFAULT_BACKGROUND_MUSIC: MusicName = "none";

const TickOptions: RodioOption[] = [
  { label: "无", value: "none" },
  { label: "指针", value: "default_tick" },
  { label: "钟摆", value: "tick-tock_tick" },
  { label: "木鱼", value: "mokugyo_tick" },
  // { label: "心跳", value: "heartbeat_tick" },
  { label: "心电", value: "ekg_tick" },
  // { label: "蔡徐坤", value: "kun_tick" },
];

const BackgroundOptions: RodioOption[] = [
  { label: "无", value: "none" },
  // { label: "白噪音", value: "white-noise_music" },
  { label: "下雨", value: "rain_music" },
  { label: "强风", value: "wind-strong_music" },
  { label: "海滩", value: "beach_music" },
  { label: "自然（溪流）", value: "nature-stream_music" },
  { label: "自然（虫鸣）", value: "nature-crickets_music" },
];

export default (props: Props) => {
  const [editingTick, setEditingTick] = createSignal<TickName>(DEFAULT_TICK_SOUND);
  const [submittedTick, setSubmittedTick] = createSignal<TickName>(DEFAULT_TICK_SOUND);
  const [editingBackground, setEditingBackground] = createSignal<MusicName>(DEFAULT_BACKGROUND_MUSIC);
  const [submittedBackground, setSubmittedBackground] = createSignal<MusicName>(DEFAULT_BACKGROUND_MUSIC);

  const handleTickChange = async (value: string) => {
    const tick = value as TickName;
    setEditingTick(tick);
    await previewSound(tick, 1.0);
  };

  const handleBackgroundChange = async (value: string) => {
    const music = value as MusicName;
    setEditingBackground(music);
    await previewSound(music, 1.0);
  };

  const handleSoundConfirm = async () => {
    if (editingTick() !== submittedTick()) {
      await writeSettings({ tickSound: editingTick() });
    }
    if (editingBackground() !== submittedBackground()) {
      await writeSettings({ backgroundMusic: editingBackground() });
    }

    return true;
  };

  const handleSoundCancel = () => {
    setEditingTick(submittedTick());
    setEditingBackground(submittedBackground());
  };

  onMount(async () => {
    await onSettingsUpdated((settings) => {
      if (settings.tickSound != null) {
        setEditingTick(settings.tickSound);
        setSubmittedTick(settings.tickSound);
      }

      if (settings.backgroundMusic != null) {
        setEditingBackground(settings.backgroundMusic);
        setSubmittedBackground(settings.backgroundMusic);
      }
    });

    await ping("--push=settings");
  });

  return (
    <StandardDialog
      title="声音定制"
      open={props.open}
      setOpen={props.setOpen}
      onConfirm={handleSoundConfirm}
      onCancel={handleSoundCancel}
    >
      <div class="flex flex-col gap-[1rem]">
        <Rodio
          label="滴答音"
          value={editingTick()}
          options={TickOptions}
          onValueChange={handleTickChange}
        />
        <Rodio
          label="背景音"
          value={editingBackground()}
          options={BackgroundOptions}
          onValueChange={handleBackgroundChange}
        />
      </div>
    </StandardDialog>
  );
};
