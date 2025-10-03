import { error, info } from "@tauri-apps/plugin-log";
import Dexie, { type EntityTable } from "dexie";
import { EditingTodo } from "../dialogs/todo-dialog";
import { dict, envLocale } from "../i18n";
import { addTodos } from ".";

export const db = new Dexie("todo-database") as Dexie & {
  todos: EntityTable<Todo, "id">;
};

db.version(1).stores({
  todos: "++id, status, createdAt",
});

const INITIALIZED_KEY = "todo-initialized";

function init() {
  const handleSuccess = (n: number) => {
    info(`Inserted ${n} initial todos`);
    localStorage.setItem(INITIALIZED_KEY, "true");
  };
  const handleError = (e: Error) => error(`Failed to insert initial todos: ${e.message}`);

  addTodos(todos()).then(handleSuccess).catch(handleError);
}

if (!localStorage.getItem(INITIALIZED_KEY)) {
  info("Database not initialized, inserting initial todos");
  init();
} else {
  info("Database already initialized");
}

function todos(): EditingTodo[] {
  const t = dict[envLocale];

  return [
    {
      subject: t.todo.initial_todos.start_a_pomodoro,
      status: "focusing",
      startedAt: Date.now(),
    },
    {
      subject: t.todo.initial_todos.swipe_left_to_operate,
      status: "created",
    },
    {
      subject: t.todo.initial_todos.this_is_a_finished_todo,
      status: "finished",
      finishedAt: Date.now(),
      pomodoroCount: 1,
    },
  ];
}
