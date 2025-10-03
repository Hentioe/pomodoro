// 状态：已创建，专注中，已完成
type TodoStatus = "created" | "focusing" | "finished";

interface Todo {
  // ID
  id: number;
  // 主题
  subject: string;
  // 状态
  status: TodoStatus;
  // 创建时间
  createdAt: number;
  // 开始时间
  startedAt?: number | null;
  // 完成时间
  finishedAt?: number | null;
  // 番茄数量
  pomodoroCount?: number | null;
  // 用于排序的元字段
  sortPriority: number;
}
