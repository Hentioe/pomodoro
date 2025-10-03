import { Icon, IconifyIcon } from "@iconify-icon/solid";
import classNames from "classnames";
import { createSignal, For, Match, onMount, Show, Switch } from "solid-js";
import { locale, proxyTranslator } from "../../i18n";
import icons from "../../icons";
import { deleteTodo, getTodoList, ListScope, updateTodo } from "../../todo";
import { formatTodoDate, formatTodoTime } from "./helper";

interface CommonActionsProps {
  onEdit: (id: number) => void;
}

export default (props: CommonActionsProps) => {
  const t = proxyTranslator();

  const [list, setList] = createSignal<Todo[]>([]);
  const [scope, setScope] = createSignal<ListScope>(ListScope.Today);

  const handleDelete = async (id: number) => {
    await deleteTodo(id);
    await refresh();
  };

  const handleFocus = async (id: number) => {
    await updateTodo(id, { status: "focusing", startedAt: Date.now() });
    await refresh();
  };

  const handleCancelFocus = async (id: number) => {
    await updateTodo(id, { status: "created", startedAt: null });
    await refresh();
  };

  const handleFinish = async (id: number) => {
    await updateTodo(id, { status: "finished", finishedAt: Date.now() });
    await refresh();
  };

  const handleCancelFinish = async (id: number) => {
    await updateTodo(id, { status: "created", finishedAt: null });
    await refresh();
  };

  const handleScopeChange = (newScope: ListScope) => {
    setScope(newScope);
    refresh();
  };

  const refresh = async () => {
    setList(structuredClone(await getTodoList(scope()))); // 由于模拟数据始终访问同一个对象引用，这里必须深克隆
  };

  onMount(async () => {
    await refresh();
  });

  return (
    <>
      <div class="flex items-center gap-[1.25rem]">
        <Range
          active={scope() === ListScope.Today}
          onClick={() => handleScopeChange(ListScope.Today)}
          icon={icons.ClipboardBold}
          label={t.todo.range.today()}
          colorScheme="red"
        />
        <Range
          active={scope() === ListScope.Recent}
          onClick={() => handleScopeChange(ListScope.Recent)}
          icon={icons.WorkHistory}
          label={t.todo.range.recent()}
          colorScheme="yellow"
        />
        <Range
          active={scope() === ListScope.Finished}
          onClick={() => handleScopeChange(ListScope.Finished)}
          icon={icons.Done}
          label={t.todo.range.finished()}
          colorScheme="green"
        />
      </div>
      <div class="mt-[1rem] flex flex-col gap-[0.5rem]">
        <For each={list()}>
          {(todo) => (
            <TodoPreview
              todo={todo}
              onFocus={handleFocus}
              onCancelFocus={handleCancelFocus}
              onFinish={handleFinish}
              onCancelFinish={handleCancelFinish}
              onEdit={props.onEdit}
              onDelete={handleDelete}
            />
          )}
        </For>
      </div>
    </>
  );
};

const Range = (
  props: { icon: string | IconifyIcon; label: string; active?: boolean; colorScheme: string; onClick: VoidFunction },
) => {
  return (
    <div
      onClick={props.onClick}
      class={classNames([
        "flex-1 py-[0.25rem] rounded-[1rem] flex flex-col items-center gap-[0.5rem] border border-zinc-200/60 bg-white text-white",
        {
          "text-red-400!": !props.active && props.colorScheme === "red",
          "text-yellow-400!": !props.active && props.colorScheme === "yellow",
          "text-green-400!": !props.active && props.colorScheme === "green",
        },
        {
          "bg-red-400!": props.active && props.colorScheme === "red",
          "bg-yellow-400!": props.active && props.colorScheme === "yellow",
          "bg-green-400!": props.active && props.colorScheme === "green",
        },
      ])}
    >
      <div class="w-[3.5rem] h-[3.5rem] bg-white/40 rounded-full flex justify-center items-center">
        <Icon
          icon={props.icon}
          class="text-[1.5rem] w-[1.5rem] h-[1.5rem] "
        />
      </div>
      <p class="text-center font-medium">
        {props.label}
      </p>
    </div>
  );
};

interface ItemProps {
  todo: Todo;
  onDelete: (id: number) => Promise<void>;
  onFocus: (id: number) => Promise<void>;
  onCancelFocus: (id: number) => Promise<void>;
  onFinish?: (id: number) => Promise<void>;
  onCancelFinish?: (id: number) => Promise<void>;
}

const TodoPreview = (props: ItemProps & CommonActionsProps) => {
  const t = proxyTranslator();
  const [isActionButtonsShow, setIsActionButtonsShow] = createSignal(false);

  let rootEl: HTMLDivElement | undefined;
  let contentEl: HTMLDivElement | undefined;

  const handleActionButtonsToggle = () => {
    setIsActionButtonsShow(!isActionButtonsShow());
  };

  const handleFinishedToggle = async () => {
    if (props.todo.status === "finished") {
      await props.onCancelFinish?.(props.todo.id);
    } else {
      await props.onFinish?.(props.todo.id);
    }
  };

  onMount(() => {
    rootEl?.addEventListener("swiped-left", () => {
      setIsActionButtonsShow(true);
    });
    rootEl?.addEventListener("swiped-right", () => {
      setIsActionButtonsShow(false);
    });
  });

  const IconTag = (props: { icon: IconifyIcon; label: string }) => {
    return (
      <div class="flex justify-center items-center gap-[0.15rem]">
        <Icon icon={props.icon} class="w-[0.9rem] h-[0.9rem]" />
        <span>{props.label}</span>
      </div>
    );
  };

  const TimeTag = () => {
    const { status, createdAt, startedAt } = props.todo;

    let dateTime = createdAt;
    if (status === "focusing" && startedAt) {
      dateTime = startedAt;
    }

    return <IconTag icon={icons.TodoTime} label={formatTodoTime(dateTime, locale())} />;
  };

  const DateTag = () => {
    const { status, createdAt, startedAt } = props.todo;

    let dateTime = createdAt;
    if (status === "focusing" && startedAt) {
      dateTime = startedAt;
    }

    let label = formatTodoDate(dateTime);
    if (label === "Today") {
      label = t.todo.range.today();
    }

    return <IconTag icon={icons.CalendarLinear} label={label} />;
  };

  const FinishCircle = () => {
    return (
      <div
        onClick={handleFinishedToggle}
        class="w-[2.25rem] h-[2.25rem] bg-white rounded-full flex justify-center items-center"
      >
        <div
          class={classNames([
            "w-[0.75rem] h-[0.75rem] rounded-full ring-2 ring-offset-2 ring-blue-500",
            { "bg-blue-500": props.todo.status === "finished" },
            { "bg-white": props.todo.status !== "finished" },
          ])}
        />
      </div>
    );
  };

  return (
    <div ref={rootEl} class="relative h-[4rem] rounded-[2rem] overflow-hidden">
      {/* 操作按钮 */}
      <div
        class={classNames([
          "flex absolute top-0 right-0 h-full",
          { "opacity-100": isActionButtonsShow(), "opacity-0": !isActionButtonsShow() },
        ])}
      >
        <Switch>
          <Match when={props.todo.status === "focusing"}>
            <ActionButton
              icon={icons.PinOff}
              label={t.todo.actions.cancel()}
              color="gray"
              onClick={() => props.onCancelFocus(props.todo.id)}
            />
          </Match>
          <Match when={true}>
            <ActionButton
              icon={icons.Pin}
              label={t.todo.actions.focus()}
              color="blue"
              onClick={() => props.onFocus(props.todo.id)}
            />
          </Match>
        </Switch>
        <ActionButton
          icon={icons.Edit}
          label={t.todo.actions.edit()}
          color="green"
          onClick={() => props.onEdit(props.todo.id)}
        />
        <ActionButton
          icon={icons.Delete}
          label={t.todo.actions.delete()}
          color="red"
          onClick={() => props.onDelete(props.todo.id)}
        />
      </div>
      {/* 内容 */}
      <div
        ref={contentEl}
        class={classNames([
          "transition-all duration-100 absolute inset-0 bg-blue-100 px-[1rem] py-[0.5rem] flex items-center",
          { "translate-x-[-12rem]": isActionButtonsShow() },
        ])}
      >
        {/* 是否完成的圆 */}
        <FinishCircle />
        {/* 内容 */}
        <div class="flex-1 px-[1rem]">
          <div class="text-[0.9rem] text-gray-600 flex items-center gap-[0.5rem]">
            <Show when={props.todo.status === "focusing"}>
              <Icon icon={icons.Pin} class="text-red-400 w-[0.9rem]" />
            </Show>
            <DateTag />
            <TimeTag />
          </div>
          <p class="line-clamp-1">
            {props.todo.subject}
          </p>
        </div>
        {/* 更多按钮 */}
        <div
          onClick={handleActionButtonsToggle}
          class={classNames([
            "bg-white/90 w-[1.75rem] h-[1.75rem] rounded-full flex justify-center items-center",
            // 旋转 90 度
            { "rotate-90": isActionButtonsShow() },
          ])}
        >
          <Icon icon={icons.More} class="w-[1rem] text-zinc-400" />
        </div>
      </div>
    </div>
  );
};

const ActionButton = (props: { icon: IconifyIcon; label: string; color: string; onClick: VoidFunction }) => {
  return (
    <button
      onClick={props.onClick}
      class={classNames([
        "w-[4rem] h-full text-white flex flex-col justify-center items-center gap-[0.25rem]",
        { "bg-blue-500": props.color === "blue" },
        { "bg-gray-500": props.color === "gray" },
        { "bg-green-500": props.color === "green" },
        { "bg-red-500": props.color === "red" },
      ])}
    >
      <Icon icon={props.icon} class="text-[1rem] h-[1rem] w-[1rem]" />
      <span class="text-sm font-medium">{props.label}</span>
    </button>
  );
};
