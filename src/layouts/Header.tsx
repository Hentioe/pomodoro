import { Icon, IconifyIcon } from "@iconify-icon/solid";
import { createSignal, onMount, Show } from "solid-js";
import { onSettingsUpdated, ping, previewSound, SoundName, writeSettings } from "tauri-plugin-backend-api";
import { StandardDialog } from "../components";
import Rodio from "../components/Rodio";
import AboutDialog from "../dialogs/AboutDialog";
import TimerDialog from "../dialogs/TimerDialog";
import VolumeDialog from "../dialogs/VolumeDialog";
import icons from "../icons";
import { UpdateChecker } from "../update-checker";
import NewVersionDialog from "./NewVersionDialog";

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
  { label: "白噪音", value: "white-noise" },
  { label: "森林", value: "forest" },
  { label: "雨声", value: "rain" },
];

const DEFAULT_TICK_SOUND: SoundName = "default_tick";

export default (props: { update?: Update; updateChecker?: UpdateChecker }) => {
  const [tickSound, setTickSound] = createSignal<SoundName>(DEFAULT_TICK_SOUND);
  const [editingTickSound, setEditingTickSound] = createSignal<SoundName>(DEFAULT_TICK_SOUND);
  const [soundDialogOpen, setSoundDialogOpen] = createSignal(false);
  const [volumeDialogOpen, setVolumeDialogOpen] = createSignal(false);
  const [newVersionDialogOpen, setNewVersionDialogOpen] = createSignal(false);
  const [aboutNewDialogOpen, setAboutNewDialogOpen] = createSignal(false);
  const [timerDialogOpen, setTimerDialogOpen] = createSignal(false);

  const handleTickSoundChange = async (value: string) => {
    const editing = value as SoundName;
    setEditingTickSound(editing);
    await previewSound(editing, 1.0);
  };

  const handleTickSoundConfirm = async () => {
    await writeSettings({ tickSound: editingTickSound() });

    return true;
  };

  const handleTickSoundCancel = () => {
    setEditingTickSound(tickSound());
  };

  const Version = () => {
    return <p class="bg-white text-black text-base rounded-lg px-[0.5rem]">开发版</p>;
  };

  const MusicDialog = () => {
    return (
      <StandardDialog
        title="声音定制"
        open={soundDialogOpen}
        setOpen={setSoundDialogOpen}
        onConfirm={handleTickSoundConfirm}
        onCancel={handleTickSoundCancel}
      >
        <div class="flex flex-col gap-[1rem]">
          <Rodio
            label="滴答音"
            value={editingTickSound()}
            options={TickOptions}
            onValueChange={handleTickSoundChange}
          />
          <Rodio label="背景音" value="none" options={BackgroundOptions} />
        </div>
      </StandardDialog>
    );
  };

  onMount(async () => {
    await onSettingsUpdated((settings) => {
      if (settings.tickSound) {
        setTickSound(settings.tickSound);
        setEditingTickSound(settings.tickSound);
      }
    });

    await ping("--push=settings");
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
      <MusicDialog />
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
        updateChecker={props.updateChecker}
        onClose={() => setAboutNewDialogOpen(false)}
      />
    </>
  );
};

const NavIcon = (props: { icon: string | IconifyIcon; onClick?: () => void }) => {
  return <Icon icon={props.icon} onClick={props.onClick} class="text-[1.5rem] h-[1.5rem] w-[1.5rem]" />;
};
