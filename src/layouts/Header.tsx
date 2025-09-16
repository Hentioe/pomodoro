import { Icon, IconifyIcon } from "@iconify-icon/solid";
import { openUrl } from "@tauri-apps/plugin-opener";
import { Show } from "solid-js";
import icons from "../icons";

export default (props: { update?: Update }) => {
  const handleClickUpdate = async () => {
    const url = props.update?.download?.[0].url;
    if (url) {
      await openUrl(url);
    }
  };

  const Version = () => {
    return <p class="bg-white text-black text-base rounded-lg px-[0.5rem]">内测版</p>;
  };
  return (
    <header class="absolute top-[1rem] left-[1rem] right-[1rem] text-zinc-200 flex justify-between items-center">
      <div class="flex-1">
        <NavIcon icon="alarm-news" />
      </div>
      <Show when={props.update} fallback={<Version />}>
        <p onClick={handleClickUpdate} class="bg-red-500 text-zinc-100 text-base rounded-lg px-[0.5rem] cursor-pointer">
          发现新版本
        </p>
      </Show>
      <div class="flex-1 flex gap-[1rem] items-center justify-end">
        <NavIcon icon={icons.Volume} />
        <NavIcon icon={icons.Setting} />
      </div>
    </header>
  );
};

const NavIcon = (props: { icon: string | IconifyIcon }) => {
  return <Icon icon={props.icon} class="text-[1.5rem] h-[1.5rem] w-[1.5rem]" />;
};
