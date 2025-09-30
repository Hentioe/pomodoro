import { Icon } from "@iconify-icon/solid";
import { Setter } from "solid-js";
import icons from "../icons";

interface Props {
  title: string;
  setOpen: Setter<boolean>;
}

export default (props: Props) => {
  return (
    <div class="flex justify-between">
      <div class="w-[1.5rem]" />
      <p class="text-center text-xl font-medium">{props.title}</p>
      <div
        onClick={() => props.setOpen(false)}
        class="w-[1.5rem] h-[1.5rem] bg-zinc-300/50 rounded-full flex justify-center items-center"
      >
        <Icon
          icon={icons.CloseLine}
          class="w-[1rem] h-[1rem] text-[1rem] cursor-pointer hover:text-zinc-500"
        />
      </div>
    </div>
  );
};
