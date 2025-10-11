import { Icon, IconifyIcon } from "@iconify-icon/solid";
import { isToday } from "date-fns";
import { createEffect, createSignal, Show } from "solid-js";
import { locale, proxyTranslator } from "../../i18n";
import icons from "../../icons";
import { formatTodoDate, formatTodoTime } from "./helper";

export default (props: { todo: Todo }) => {
  const [isCreatedToday, setIsCreatedToday] = createSignal(isToday(props.todo.createdAt));

  createEffect(() => {
    setIsCreatedToday(isToday(props.todo.createdAt));
  });

  const t = proxyTranslator();
  const DateTag = () => {
    const { status, createdAt, startedAt } = props.todo;

    let dateTime = createdAt;
    if (status === "focusing" && isCreatedToday() && startedAt) {
      dateTime = startedAt;
    }

    let label = formatTodoDate(dateTime);
    if (label === "Today") {
      label = t.todo.range.today();
    }

    return <IconTag icon={icons.CalendarLinear} label={label} />;
  };

  const TimeTag = () => {
    const { status, createdAt, startedAt } = props.todo;

    let dateTime = createdAt;
    if (status === "focusing" && startedAt) {
      dateTime = startedAt;
    }

    return <IconTag icon={icons.TodoTime} label={formatTodoTime(dateTime, locale())} />;
  };

  return (
    <div class="text-[0.9rem] text-zinc-500 flex items-center gap-[0.5rem]">
      <DateTag />
      <Show when={isCreatedToday()}>
        <TimeTag />
      </Show>
    </div>
  );
};

const IconTag = (props: { icon: IconifyIcon; label: string }) => {
  return (
    <div class="flex justify-center items-center gap-[0.15rem]">
      <Icon icon={props.icon} class="w-[0.9rem] h-[0.9rem]" />
      <span>{props.label}</span>
    </div>
  );
};
