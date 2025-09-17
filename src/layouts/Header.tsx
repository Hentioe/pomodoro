import { Icon, IconifyIcon } from "@iconify-icon/solid";
import { openUrl } from "@tauri-apps/plugin-opener";
import { createSignal, Show } from "solid-js";
import { Dialog } from "../components";
import Rodio from "../components/Rodio";
import icons from "../icons";

const TickOptions: RodioOption[] = [
  { label: "无", value: "none" },
  { label: "指针", value: "pointer" },
  { label: "心电", value: "ecg" },
  { label: "钟摆", value: "pendulum" },
  { label: "蔡徐坤", value: "kun" },
];

// const BackgroundOptions: RodioOption[] = [
//   { label: "无", value: "none" },
//   { label: "白噪音", value: "white-noise" },
//   { label: "森林", value: "forest" },
//   { label: "雨声", value: "rain" }
// ];

export default (props: { update?: Update }) => {
  const [tickSound, setTickSound] = createSignal("pointer");
  const [musicDialogOpen, setMusicDialogOpen] = createSignal(false);
  const [volumeDialogOpen, setVolumeDialogOpen] = createSignal(false);
  const handleClickUpdate = async () => {
    const url = props.update?.download?.[0].url;
    if (url) {
      await openUrl(url);
    }
  };

  const Version = () => {
    return <p class="bg-white text-black text-base rounded-lg px-[0.5rem]">内测版</p>;
  };

  const MusicDialog = () => {
    return (
      <Dialog title="音乐" open={musicDialogOpen} setOpen={setMusicDialogOpen}>
        <Rodio label="滴答声" value={tickSound()} options={TickOptions} onValueChange={setTickSound} />
        {/* <Rodio label="背景声" value="none" options={BackgroundOptions} /> */}
      </Dialog>
    );
  };

  const VolumeDialog = () => {
    return (
      <Dialog title="音量" open={volumeDialogOpen} setOpen={setVolumeDialogOpen}>
        我是音量弹窗
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
          <NavIcon icon="tabler:music" onClick={() => setMusicDialogOpen(true)} />
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
