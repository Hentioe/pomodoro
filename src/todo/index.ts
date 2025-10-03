import { endOfToday, startOfToday } from "date-fns";
import { PromiseExtended } from "dexie";
import { db } from "./initializer";

type AddingTodo = Omit<Todo, "id" | "createdAt" | "sortPriority">;

export function addTodo(todo: AddingTodo): PromiseExtended<number> {
  return addTodos([todo]);
}

export function addTodos(todos: AddingTodo[]): PromiseExtended<number> {
  const createdAt = Date.now();
  const todosWithIds = todos.map((todo) => {
    const sortPriority = sortPriorityGen(todo.status);
    return { ...todo, createdAt, sortPriority };
  });

  return db.todos.bulkAdd(todosWithIds);
}

export function getTodo(id: number): PromiseExtended<Todo | undefined> {
  return db.todos.get(id);
}

export enum ListScope {
  Today,
  Recent,
  Finished,
}

const UNFINISHED_STATUS: Todo["status"][] = ["created", "focusing"];

export async function getTodoList(scope: ListScope): Promise<Todo[]> {
  let query;

  switch (scope) {
    case ListScope.Today:
      // 今天
      const startTimestamp = startOfToday().getTime();
      const endTimestamp = endOfToday().getTime();
      // 查询今天的数据时，先按创建时间范围过滤，再按状态过滤，节约性能
      query = db.todos.where("createdAt").between(startTimestamp, endTimestamp, true, true).and((todo) =>
        UNFINISHED_STATUS.includes(todo.status)
      );
      break;

    case ListScope.Recent:
      // 最近
      // 查询最近的数据时，先按状态过滤，再按创建时间范围过滤，节约性能
      query = db.todos.where("status").anyOf(UNFINISHED_STATUS).and((todo) => todo.createdAt > endOfToday().getTime());
      break;

    case ListScope.Finished:
      // 完成
      query = db.todos.where("status").equals("finished");
      break;
  }

  const todos = await query.toArray();

  todos.sort((a, b) => {
    // 先比较 sortPriority，按降序排（大的在前）
    if (a.sortPriority !== b.sortPriority) {
      return b.sortPriority - a.sortPriority;
    }
    // 如果 sortPriority 相同，则比较时间，按降序排（新的在前）
    if (scope === ListScope.Finished) {
      return (b.finishedAt ?? 0) - (a.finishedAt ?? 0);
    } else {
      return b.createdAt - a.createdAt;
    }
  });

  return todos;
}

export function updateTodo(id: number, updates: Partial<Omit<Todo, "id" | "createdAt">>): PromiseExtended<number> {
  if (updates.status) {
    const sortPriority = sortPriorityGen(updates.status);
    return db.todos.update(id, { ...updates, sortPriority });
  } else {
    return db.todos.update(id, { ...updates });
  }
}

export function deleteTodo(id: number): PromiseExtended<void> {
  return db.todos.delete(id);
}

function sortPriorityGen(status?: Todo["status"]): number {
  return status === "focusing" ? 1 : 0;
}
