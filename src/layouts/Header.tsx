import { Icon, IconifyIcon } from "@iconify-icon/solid";
import { openUrl } from "@tauri-apps/plugin-opener";
import { createSignal, For, onMount, Show } from "solid-js";
import { createStore } from "solid-js/store";
import {
  onSettingsUpdated,
  ping,
  previewSound,
  SoundDefaultName,
  SoundName,
  writeSettings,
} from "tauri-plugin-backend-api";
import { Dialog } from "../components";
import Dialog2 from "../components/Dialog2";
import Rodio from "../components/Rodio";
import Slider from "../components/Slider";
import icons from "../icons";
import AboutNew from "./AboutNew";

type Volumes = {
  [key in SoundDefaultName]: number;
};

const TickOptions: RodioOption[] = [
  { label: "无", value: "none" },
  { label: "指针", value: "default_tick" },
  { label: "钟摆", value: "tick-tock_tick" },
  { label: "木鱼", value: "mokugyo_tick" },
  // { label: "心跳", value: "heartbeat_tick" },
  { label: "心电", value: "ekg_tick" },
  // { label: "蔡徐坤", value: "kun_tick" },
];

// const BackgroundOptions: RodioOption[] = [
//   { label: "无", value: "none" },
//   { label: "白噪音", value: "white-noise" },
//   { label: "森林", value: "forest" },
//   { label: "雨声", value: "rain" }
// ];

const DEFAULT_TICK_SOUND: SoundName = "default_tick";
const DEFAULT_TICK_VOLUME = 0.5;
const DEFAULT_ALARM_VOLUME = 0.8;
const DEFAULT_PROMPT_VOLUME = 0.8;
const DEFAULT_BACKGROUND_VOLUME = 0.6;

export default (props: { update?: Update }) => {
  const [tickSound, setTickSound] = createSignal<SoundName>(DEFAULT_TICK_SOUND);
  const [editingTickSound, setEditingTickSound] = createSignal<SoundName>(DEFAULT_TICK_SOUND);
  const [volumes, setVolumes] = createStore<Volumes>({
    tick_default: DEFAULT_TICK_VOLUME,
    alarm_default: DEFAULT_ALARM_VOLUME,
    prompt_default: DEFAULT_PROMPT_VOLUME,
    background_default: DEFAULT_BACKGROUND_VOLUME,
  });
  const [editingVolumes, setEditingVolumes] = createStore<Volumes>({
    tick_default: DEFAULT_TICK_VOLUME,
    alarm_default: DEFAULT_ALARM_VOLUME,
    prompt_default: DEFAULT_PROMPT_VOLUME,
    background_default: DEFAULT_BACKGROUND_VOLUME,
  });
  const [soundDialogOpen, setSoundDialogOpen] = createSignal(false);
  const [volumeDialogOpen, setVolumeDialogOpen] = createSignal(false);
  const [newVersionDialogOpen, setNewVersionDialogOpen] = createSignal(false);
  const [aboutNewDialogOpen, setAboutNewDialogOpen] = createSignal(false);

  const handleTickSoundChange = async (value: string) => {
    const editing = value as SoundName;
    setEditingTickSound(editing);
    await previewSound(editing, 1.0);
  };

  const handleVolumeChange = (type: SoundDefaultName, value: number) => {
    setEditingVolumes(type, value);
    // 预览当前大小的声音
    previewSound(type, value);
  };

  const handleVolumeConfirm = async () => {
    await writeSettings({
      tickVolume: editingVolumes.tick_default,
      alarmVolume: editingVolumes.alarm_default,
      promptVolume: editingVolumes.prompt_default,
    });

    return true;
  };

  const handleVolumeCancel = () => {
    setEditingVolumes("tick_default", volumes.tick_default);
    setEditingVolumes("alarm_default", volumes.alarm_default);
    setEditingVolumes("prompt_default", volumes.prompt_default);
  };

  const handleTickSoundConfirm = async () => {
    await writeSettings({ tickSound: editingTickSound() });

    return true;
  };

  const handleTickSoundCancel = () => {
    setEditingTickSound(tickSound());
  };

  const handleUpdateConfirm = async () => {
    const url = props.update?.download?.[0].url;
    if (url) {
      await openUrl(url);
    }

    return true;
  };

  const Version = () => {
    return <p class="bg-white text-black text-base rounded-lg px-[0.5rem]">开发版</p>;
  };

  const MusicDialog = () => {
    return (
      <Dialog
        title="声音定制"
        open={soundDialogOpen}
        setOpen={setSoundDialogOpen}
        onConfirm={handleTickSoundConfirm}
        onCancel={handleTickSoundCancel}
      >
        <Rodio label="滴答音" value={editingTickSound()} options={TickOptions} onValueChange={handleTickSoundChange} />
        {/* <Rodio label="背景音" value="none" options={BackgroundOptions} /> */}
      </Dialog>
    );
  };

  const ChangelogSummary = (props: { content: string }) => {
    return (
      <For each={props.content.split("\n")}>
        {(line) => <p>{line}</p>}
      </For>
    );
  };

  const NewVersionDialog = () => {
    return (
      <Dialog
        title="发现新版本"
        open={newVersionDialogOpen}
        setOpen={setNewVersionDialogOpen}
        onConfirm={handleUpdateConfirm}
        confirmText="前往下载"
      >
        <ChangelogSummary content={props.update?.changelog?.summary || "无更新内容"} />
      </Dialog>
    );
  };

  onMount(async () => {
    await onSettingsUpdated((settings) => {
      if (settings.tickSound) {
        setTickSound(settings.tickSound);
        setEditingTickSound(settings.tickSound);
      }
      if (settings.tickVolume != null) {
        setVolumes("tick_default", settings.tickVolume);
        setEditingVolumes("tick_default", settings.tickVolume);
      }
      if (settings.alarmVolume != null) {
        setVolumes("alarm_default", settings.alarmVolume);
        setEditingVolumes("alarm_default", settings.alarmVolume);
      }
      if (settings.promptVolume != null) {
        setVolumes("prompt_default", settings.promptVolume);
        setEditingVolumes("prompt_default", settings.promptVolume);
      }
    });

    ping("header_mounted");
  });

  const VolumeDialog = () => {
    return (
      <Dialog
        title="音量大小"
        open={volumeDialogOpen}
        setOpen={setVolumeDialogOpen}
        onConfirm={handleVolumeConfirm}
        onCancel={handleVolumeCancel}
      >
        <div class="flex flex-col gap-[1rem]">
          <Slider
            label="滴答音"
            value={editingVolumes.tick_default}
            onValueChangeEnd={(v) => handleVolumeChange("tick_default", v)}
          />
          <Slider
            label="闹铃音"
            value={editingVolumes.alarm_default}
            onValueChangeEnd={(v) => handleVolumeChange("alarm_default", v)}
          />
          <Slider
            label="提示音"
            value={editingVolumes.prompt_default}
            onValueChangeEnd={(v) => handleVolumeChange("prompt_default", v)}
          />
          {
            /* <Slider
            label="背景音"
            value={volumes.background_default}
            onValueChangeEnd={(v) => handleVolumeChange("background_default", v)}
          /> */
          }
        </div>
      </Dialog>
    );
  };

  const AboutNewDialog = () => {
    return (
      <Dialog2 open={aboutNewDialogOpen} setOpen={setAboutNewDialogOpen}>
        <AboutNew onClose={() => setAboutNewDialogOpen(false)} />
      </Dialog2>
    );
  };

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
          <NavIcon icon={icons.Volume} onClick={() => setVolumeDialogOpen(true)} />
          <NavIcon icon={icons.Music} onClick={() => setSoundDialogOpen(true)} />
        </div>
      </header>
      <MusicDialog />
      <VolumeDialog />
      <NewVersionDialog />
      <AboutNewDialog />
    </>
  );
};

const NavIcon = (props: { icon: string | IconifyIcon; onClick?: () => void }) => {
  return <Icon icon={props.icon} onClick={props.onClick} class="text-[1.5rem] h-[1.5rem] w-[1.5rem]" />;
};
