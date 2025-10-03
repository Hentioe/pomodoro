import { SetStoreFunction } from "solid-js/store";
import { proxyTranslator } from "../../i18n";
import { EditingTodo } from ".";

interface Props {
  todo?: EditingTodo;
  setTodo: SetStoreFunction<EditingTodo>;
}

export default (props: Props) => {
  const t = proxyTranslator();

  const handleSubjectChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    props.setTodo({ subject: target.value });
  };

  return (
    <div>
      <input
        value={props.todo?.subject || ""}
        onChange={handleSubjectChange}
        name="title"
        type="text"
        placeholder={t.todo.editing.subject_placeholder()}
        class="w-full py-[0.5rem] border-b-2 border-zinc-400 focus:border-blue-400 outline-0"
      />
    </div>
  );
};
