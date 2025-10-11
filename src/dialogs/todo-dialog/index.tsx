import { isToday } from "date-fns";
import { createSignal, Match, Switch } from "solid-js";
import { createStore } from "solid-js/store";
import BasicDialog, { OpenProps } from "../../components/BasicDialog";
import DialogDecoration, { ControlButton } from "../../components/DialogDecoration";
import { proxyTranslator } from "../../i18n";
import { addTodo, getTodo, ListScope, updateTodo } from "../../todo";
import TodoEdit from "./TodoEdit";
import TodoList from "./TodoList";

type Props = OpenProps;
export type EditingTodo = Pick<Todo, "subject" | "status" | "startedAt" | "finishedAt" | "pomodoroCount">;

const EMPTY_EDITING: EditingTodo = { subject: "", status: "created" };

export default (props: Props) => {
  const t = proxyTranslator();

  const [scope, setScope] = createSignal<ListScope>(ListScope.Today);
  const [isEditing, setIsEditing] = createSignal(false);
  const [editingId, setEditingId] = createSignal<number | null>(null);
  const [editingTodo, setEditingTodo] = createStore<EditingTodo>(structuredClone(EMPTY_EDITING));

  const handleAdd = () => setIsEditing(true);
  const handleEdit = async (id: number) => {
    setEditingId(id);
    setEditingTodo(await getTodo(id) || structuredClone(EMPTY_EDITING));
    setIsEditing(true);
  };

  const handleBack = () => {
    setIsEditing(false);
    setEditingId(null);
    setEditingTodo(structuredClone(EMPTY_EDITING));
  };

  const handleExitComplete = () => {
    setIsEditing(false);
    setEditingId(null);
    setEditingTodo(structuredClone(EMPTY_EDITING));
  };

  const handleSave = async () => {
    const id = editingId();
    if (id != null) {
      await updateTodo(id, { subject: editingTodo.subject });
      const created = await getTodo(id);
      if (created && isToday(created?.createdAt)) {
        setScope(ListScope.Today); // 如果更新的是今天的任务，切换到今天视图
      }
    } else {
      await addTodo({ subject: editingTodo.subject, status: "created" });
      setScope(ListScope.Today);
    }

    setIsEditing(false);
    setEditingId(null);
    setEditingTodo(structuredClone(EMPTY_EDITING));
  };

  const EditingFooter = () => {
    return (
      <div class="flex flex-col gap-[0.5rem]">
        <button onClick={handleSave} class="rounded-full bg-blue-500 text-white py-2">{t.todo.save()}</button>
      </div>
    );
  };

  const Footer = () => {
    return (
      <div class="flex flex-col gap-[0.5rem]">
        <button onClick={handleAdd} class="rounded-full bg-blue-500 text-white py-2">{t.todo.add()}</button>
        <button onClick={() => props.setOpen(false)} class="rounded-full bg-zinc-200 text-zinc-700 py-2">
          {t.todo.close()}
        </button>
      </div>
    );
  };

  return (
    <BasicDialog
      fullScreen
      open={props.open}
      setOpen={props.setOpen}
      onExitComplete={handleExitComplete}
      header={
        <DialogDecoration
          title={t.todo.title()}
          leftButton={isEditing() ? ControlButton.Back : ControlButton.Add}
          rightButton={ControlButton.Close}
          setOpen={props.setOpen}
          onBack={handleBack}
          onAdd={handleAdd}
        />
      }
      footer={isEditing() ? <EditingFooter /> : <Footer />}
    >
      <Switch>
        <Match when={isEditing()}>
          <TodoEdit todo={editingTodo} setTodo={setEditingTodo} />
        </Match>
        <Match when={true}>
          <TodoList scope={scope} setScope={setScope} onEdit={handleEdit} />
        </Match>
      </Switch>
    </BasicDialog>
  );
};
