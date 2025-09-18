import { Icon, IconifyIcon } from "@iconify-icon/solid";
import { openUrl } from "@tauri-apps/plugin-opener";
import { createSignal, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { previewSound, SoundDefaultName, SoundName } from "tauri-plugin-backend-api";
import { Dialog } from "../components";
import Rodio from "../components/Rodio";
import Slider from "../components/Slider";
import icons from "../icons";

type Volumes = {
  [key in SoundDefaultName]: number;
};

const TickOptions: RodioOption[] = [
  { label: "无", value: "none" },
  { label: "指针", value: "pointer_tick" },
  { label: "心电", value: "tension_tick" },
  { label: "钟摆", value: "vintage_tick" },
  { label: "蔡徐坤", value: "kun_tick" },
];

// const BackgroundOptions: RodioOption[] = [
//   { label: "无", value: "none" },
//   { label: "白噪音", value: "white-noise" },
//   { label: "森林", value: "forest" },
//   { label: "雨声", value: "rain" }
// ];

export default (props: { update?: Update }) => {
  const [tickSound, setTickSound] = createSignal("pointer_tick");
  const [volumes, setVolumes] = createStore<Volumes>({
    tick_default: 0.4,
    alarm_default: 0.8,
    prompt_default: 0.6,
    background_default: 0.5,
  });
  const [soundDialogOpen, setSoundDialogOpen] = createSignal(false);
  const [volumeDialogOpen, setVolumeDialogOpen] = createSignal(false);

  const handleClickUpdate = async () => {
    const url = props.update?.download?.[0].url;
    if (url) {
      await openUrl(url);
    }
  };

  const handleTickSoundChange = async (value: string) => {
    setTickSound(value);
    await previewSound(value as SoundName, 1.0);
  };

  const handleVolumeChange = (type: SoundDefaultName, value: number) => {
    setVolumes(type, value);
  };

  const Version = () => {
    return <p class="bg-white text-black text-base rounded-lg px-[0.5rem]">内测版</p>;
  };

  const MusicDialog = () => {
    return (
      <Dialog title="声音选择" open={soundDialogOpen} setOpen={setSoundDialogOpen}>
        <Rodio label="滴答音" value={tickSound()} options={TickOptions} onValueChange={handleTickSoundChange} />
        {/* <Rodio label="背景音" value="none" options={BackgroundOptions} /> */}
      </Dialog>
    );
  };

  const VolumeDialog = () => {
    return (
      <Dialog title="音量大小" open={volumeDialogOpen} setOpen={setVolumeDialogOpen}>
        <div class="flex flex-col gap-[1rem]">
          <Slider
            label="滴答音"
            value={volumes.tick_default}
            onValueChangeEnd={(v) => handleVolumeChange("tick_default", v)}
          />
          <Slider
            label="闹铃音"
            value={volumes.alarm_default}
            onValueChangeEnd={(v) => handleVolumeChange("alarm_default", v)}
          />
          <Slider
            label="提示音"
            value={volumes.prompt_default}
            onValueChangeEnd={(v) => handleVolumeChange("prompt_default", v)}
          />
          <Slider
            label="背景音"
            value={volumes.background_default}
            onValueChangeEnd={(v) => handleVolumeChange("background_default", v)}
          />
        </div>
      </Dialog>
    );
  };

  return (
    <>
      <header class="absolute top-[1rem] left-[1rem] right-[1rem] text-zinc-200 flex justify-between items-center">
        <div class="flex-1">
          <NavIcon icon="alarm-news" />
        </div>
        <Show when={props.update} fallback={<Version />}>
          <p
            onClick={handleClickUpdate}
            class="bg-red-500 text-zinc-100 text-base rounded-lg px-[0.5rem] cursor-pointer"
          >
            发现新版本
          </p>
        </Show>
        <div class="flex-1 flex gap-[1rem] items-center justify-end">
          <NavIcon icon={icons.Volume} onClick={() => setVolumeDialogOpen(true)} />
          <NavIcon icon="tabler:music" onClick={() => setSoundDialogOpen(true)} />
        </div>
      </header>
      <MusicDialog />
      <VolumeDialog />
    </>
  );
};

const NavIcon = (props: { icon: string | IconifyIcon; onClick?: () => void }) => {
  return <Icon icon={props.icon} onClick={props.onClick} class="text-[1.5rem] h-[1.5rem] w-[1.5rem]" />;
};
