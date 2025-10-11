import { Icon, IconifyIcon } from "@iconify-icon/solid";
import classNames from "classnames";
import { Accessor, createSignal, For, Match, onMount, Setter, Show, Switch } from "solid-js";
import { proxyTranslator } from "../../i18n";
import icons from "../../icons";
import { deleteTodo, getTodoList, ListScope, updateTodo } from "../../todo";
import TodoItem from "./TodoItem";

interface Props {
  scope: Accessor<ListScope>;
  setScope: Setter<ListScope>;
}

export interface CommonActionsProps {
  onEdit: (id: number) => void;
}

export default (props: Props & CommonActionsProps) => {
  const t = proxyTranslator();

  const [isLoading, setIsLoading] = createSignal<boolean>(true);
  const [list, setList] = createSignal<Todo[]>([]);

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
    props.setScope(newScope);
    refresh();
  };

  const refresh = async () => {
    setIsLoading(true);
    setList(structuredClone(await getTodoList(props.scope()))); // 由于模拟数据始终访问同一个对象引用，这里必须深克隆
    setIsLoading(false);
  };

  const EmptyHint = (props: { scope: ListScope }) => {
    return (
      <p class="text-center text-lg text-gray-400 font-medium">
        <Switch>
          <Match when={props.scope === ListScope.Today}>
            {t.todo.empty.no_today_todos()}
          </Match>
          <Match when={props.scope === ListScope.Recent}>
            {t.todo.empty.no_recent_todos()}
          </Match>
          <Match when={props.scope === ListScope.Finished}>
            {t.todo.empty.no_finished_todos()}
          </Match>
        </Switch>
      </p>
    );
  };

  onMount(async () => {
    await refresh();
  });

  return (
    <div class="h-full flex flex-col gap-[1rem]">
      <div class="flex items-center gap-[1.25rem]">
        <Range
          active={props.scope() === ListScope.Today}
          onClick={() => handleScopeChange(ListScope.Today)}
          icon={icons.ClipboardBold}
          label={t.todo.range.today()}
          colorScheme="red"
        />
        <Range
          active={props.scope() === ListScope.Recent}
          onClick={() => handleScopeChange(ListScope.Recent)}
          icon={icons.WorkHistory}
          label={t.todo.range.recent()}
          colorScheme="yellow"
        />
        <Range
          active={props.scope() === ListScope.Finished}
          onClick={() => handleScopeChange(ListScope.Finished)}
          icon={icons.Done}
          label={t.todo.range.finished()}
          colorScheme="green"
        />
      </div>
      <div class="flex-1 flex flex-col gap-[0.5rem]">
        <Show when={list().length > 0 || isLoading()} fallback={<EmptyHint scope={props.scope()} />}>
          <For each={list()}>
            {(todo) => (
              <TodoItem
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
        </Show>
      </div>
    </div>
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
