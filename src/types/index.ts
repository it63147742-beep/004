export type Priority = 1 | 2 | 3 | 4 | 5;

export interface TodoItem {
  id: string;
  text: string;
  priority: Priority;
}

export interface TodoList {
  id: string;
  title: string;
  items: TodoItem[];
  position: { x: number; y: number };
  isCollapsed: boolean;
  width: number;
}
