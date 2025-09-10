import { addPluginListener, invoke, PluginListener } from "@tauri-apps/api/core";

export async function ping(value: string): Promise<string | null> {
  return await invoke<{ value?: string }>("plugin:backend|ping", {
    payload: {
      value,
    },
  }).then((r) => (r.value ? r.value : null));
}

export async function toast(message: string): Promise<void> {
  await invoke<{ message: string }>("plugin:backend|toast", {
    payload: {
      message,
    },
  });
}

export async function play(): Promise<void> {
  await invoke("plugin:backend|play");
}

export async function pause(): Promise<void> {
  await invoke("plugin:backend|pause");
}

export async function reset(): Promise<void> {
  await invoke("plugin:backend|reset");
}

export async function next(): Promise<void> {
  await invoke("plugin:backend|next");
}

export async function exit(): Promise<void> {
  await invoke("plugin:backend|exit");
}

export type PomodoroPhase = "focus" | "short_break" | "long_break";
export interface PomodoroState {
  phase: PomodoroPhase;
  remainingSeconds: number;
  isPlaying: boolean;
}

export async function onPomodoroUpdated(
  handler: (data: PomodoroState) => void,
): Promise<PluginListener> {
  return await addPluginListener(
    "backend",
    "pomodoro_updated",
    handler,
  );
}
