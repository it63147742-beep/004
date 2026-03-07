/**
 * Формат JSON-файла (совместим с будущими полями type, color, completed).
 */
export interface FileTask {
  id?: string;
  name: string;
  priority: number;
  color?: number;
  completed?: boolean;
}

export interface FileList {
  id: string;
  name: string;
  type?: string;
  position?: { x: number; y: number };
  isCollapsed?: boolean;
  width?: number;
  tasks: FileTask[];
}

export interface FileData {
  lists: FileList[];
}

import type { TodoList, TodoItem } from "../types";

const DEFAULT_LIST_WIDTH = 280;
const DEFAULT_POSITION = { x: 20, y: 20 };

function clampPriority(n: unknown): 1 | 2 | 3 | 4 | 5 {
  const p = Number(n);
  if (!Number.isFinite(p) || p < 1 || p > 5) return 3;
  return p as 1 | 2 | 3 | 4 | 5;
}

export function toFileData(lists: TodoList[]): FileData {
  return {
    lists: lists.map((list) => ({
      id: list.id,
      name: list.title,
      type: (list as TodoList & { type?: string }).type ?? "",
      position: list.position,
      isCollapsed: list.isCollapsed,
      width: list.width,
      tasks: list.items.map((item) => ({
        id: item.id,
        name: item.text,
        priority: item.priority,
        color: (item as TodoItem & { color?: number }).color ?? 0,
        completed: (item as TodoItem & { completed?: boolean }).completed ?? false,
      })),
    })),
  };
}

export function fromFileData(data: unknown): TodoList[] {
  if (!data || typeof data !== "object" || !Array.isArray((data as FileData).lists)) {
    return [];
  }
  const { lists } = data as FileData;
  return lists.map((list) => {
    const width =
      typeof list.width === "number" && list.width >= 200 && list.width <= 500
        ? list.width
        : DEFAULT_LIST_WIDTH;
    const items: TodoItem[] = Array.isArray(list.tasks)
      ? list.tasks.map((t) => ({
          id: t.id ?? crypto.randomUUID(),
          text: typeof t.name === "string" ? t.name : String(t.name ?? ""),
          priority: clampPriority(t.priority),
        }))
      : [];
    return {
      id: typeof list.id === "string" ? list.id : crypto.randomUUID(),
      title: typeof list.name === "string" ? list.name : "Список",
      items,
      position:
        list.position && typeof list.position.x === "number" && typeof list.position.y === "number"
          ? list.position
          : DEFAULT_POSITION,
      isCollapsed: Boolean(list.isCollapsed),
      width,
    };
  });
}

export function downloadJson(data: FileData, filename = "todo-lists.json") {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function readJsonFile(file: File): Promise<FileData | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string) as unknown;
        resolve(parsed as FileData);
      } catch {
        resolve(null);
      }
    };
    reader.onerror = () => resolve(null);
    reader.readAsText(file, "UTF-8");
  });
}
