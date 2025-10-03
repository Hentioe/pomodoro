import { Icon } from "@iconify-icon/solid";
import classNames from "classnames";
import BasicDialog, { OpenProps } from "../components/BasicDialog";
import CloseableTitleBar from "../components/CloseableTitleBar";

type Props = OpenProps;

export default (props: Props) => {
  return (
    <BasicDialog
      open={props.open}
      setOpen={props.setOpen}
      header={<CloseableTitleBar title="任务" setOpen={props.setOpen} />}
    >
      <div class="flex items-center gap-[1.25rem]">
        <Category icon="solar:clipboard-bold" label="今日" colorScheme="red" />
        <Category icon="material-symbols:work-history-sharp" label="最近" colorScheme="yellow" />
        <Category icon="lets-icons:done-ring-round-fill" label="完成" colorScheme="green" />
      </div>
      <div class="mt-[1rem] flex flex-col gap-[0.5rem]">
        <TodoPreview />
        <TodoPreview />
        <TodoPreview />
        <TodoPreview />
        <TodoPreview />
      </div>
    </BasicDialog>
  );
};

const Category = (props: { icon: string; label: string; colorScheme: string }) => {
  return (
    <div
      class={classNames([
        "flex-1 py-[1rem] rounded-[2.5rem] flex flex-col items-center gap-[0.5rem] border border-zinc-200/60",
        {
          "bg-red-400": props.colorScheme === "red",
          "bg-yellow-400": props.colorScheme === "yellow",
          "bg-green-400": props.colorScheme === "green",
        },
      ])}
    >
      <div class="w-[3.5rem] h-[3.5rem] bg-white/40 rounded-full flex justify-center items-center">
        <Icon
          icon={props.icon}
          class="text-[1.5rem] w-[1.5rem] h-[1.5rem] text-white"
        />
      </div>
      <p class="text-center font-medium text-white">
        {props.label}
      </p>
    </div>
  );
};

const TodoPreview = () => {
  const TimeTag = (props: { icon: string; label: string }) => {
    return (
      <div class="flex justify-center items-center gap-[0.15rem]">
        <Icon icon={props.icon} class="text-[0.9rem] w-[0.9rem]" />
        <span>{props.label}</span>
      </div>
    );
  };

  return (
    <div class="bg-blue-100 rounded-[2rem] px-[1rem] py-[0.5rem] flex items-center">
      <div class="w-[2.25rem] h-[2.25rem] bg-white rounded-full flex justify-center items-center">
        <div class="w-[1.2rem] h-[1.2rem] rounded-full border-2 border-blue-500" />
      </div>
      <div class="flex-1 px-[1rem]">
        <div class="text-[0.9rem] text-gray-600 flex gap-[0.5rem]">
          <TimeTag icon="solar:calendar-linear" label="今天" />
          <TimeTag icon="tdesign:time" label="下午 4:00" />
        </div>
        <p>完成 Todo 功能的开发</p>
      </div>
      <div class="bg-white w-[1.75rem] h-[1.75rem] rounded-full flex justify-center items-center">
        <Icon icon="uiw:more" class="w-[1rem] text-zinc-400" />
      </div>
    </div>
  );
};
