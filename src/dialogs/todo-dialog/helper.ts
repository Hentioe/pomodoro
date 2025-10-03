import { format, isToday } from "date-fns";
import { enUS, zhCN } from "date-fns/locale";

export function formatTodoDate(date: number) {
  const d = new Date(date);
  if (isToday(d)) {
    return "Today";
  }
  return format(d, "MM-dd");
}

export function formatTodoTime(date: number, local: Locale) {
  const d = new Date(date);
  if (local === "zh-hans") {
    return format(d, "a hh:mm", { locale: zhCN });
  } else {
    return format(d, "hh:mm a", { locale: enUS });
  }
}
