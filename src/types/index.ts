export type Priority = 1 | 2 | 3 | 4 | 5;

export type ListType = "default" | "checklist";

export interface TodoItem {
  id: string;
  text: string;
  priority: Priority;
  completed?: boolean;
}

export interface TodoList {
  id: string;
  title: string;
  type: ListType;
  items: TodoItem[];
  position: { x: number; y: number };
  isCollapsed: boolean;
  width: number;
}

export interface TrashItem extends TodoItem {
  deletedAt: number;
  sourceListId: string;
  sourceListTitle?: string;
  sourceListType?: ListType;
}
