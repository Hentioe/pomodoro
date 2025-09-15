import { Icon } from "@iconify-icon/solid";
import {} from "../icons";

export default () => {
  return (
    <header class="absolute top-[1rem] left-[1rem] right-[1rem] text-zinc-200 flex justify-between items-center">
      <div class="flex-1">
        <NavIcon icon="alarm-news" />
      </div>
      <p class="bg-white text-black text-base rounded-lg px-[0.5rem]">内测版</p>
      <div class="flex-1 flex gap-[1rem] items-center justify-end">
        <NavIcon icon="mingcute:volume-line" />
        <NavIcon icon="tdesign:setting" />
      </div>
    </header>
  );
};

const NavIcon = (props: { icon: string }) => {
  return <Icon icon={props.icon} class="text-[1.5rem] h-[1.5rem] w-[1.5rem]" />;
};
