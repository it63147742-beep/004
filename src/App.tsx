import { useState } from "react";
import { DraggableList, getNextListPosition } from "./components/DraggableList/DraggableList";
import { TrashList, type TrashListState } from "./components/TrashList/TrashList";
import { AddListButton } from "./components/AddListButton";
import { useLocalStorage } from "./hooks/useLocalStorage";
import type { TodoList, TodoItem, TrashItem, Priority } from "./types";
import "./App.css";

const TRASH_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const DEFAULT_PRIORITY: Priority = 3;
const DEFAULT_LIST_WIDTH = 280;

function migrateItem(item: Partial<TodoItem> & { id: string; text: string }): TodoItem {
  const p = item.priority;
  const priority: Priority =
    typeof p === "number" && p >= 1 && p <= 5 ? (p as Priority) : DEFAULT_PRIORITY;
  const completed = Boolean((item as TodoItem).completed);
  return { ...item, priority, completed };
}

function migrateLists(lists: TodoList[]): TodoList[] {
  if (!Array.isArray(lists)) return [];
  return lists.map((list) => {
    const listWithWidth = list as TodoList & { width?: number; type?: string };
    const type =
      listWithWidth.type === "checklist" ? "checklist" : "default";
    return {
      ...list,
      type,
      width:
        typeof listWithWidth.width === "number" &&
        listWithWidth.width >= 200 &&
        listWithWidth.width <= 500
          ? listWithWidth.width
          : DEFAULT_LIST_WIDTH,
    items: Array.isArray(list.items)
      ? list.items.map((item: Partial<TodoItem> & { id: string; text: string }) => migrateItem(item))
      : [],
    };
  });
}

const STORAGE_KEY = "todo-lists";
const TRASH_STORAGE_KEY = "todo-trash";

function migrateTrash(trash: TrashListState): TrashListState {
  if (!trash || !Array.isArray(trash.items)) {
    return {
      items: [],
      position: { x: 20, y: 60 },
      isCollapsed: true,
      width: 280,
    };
  }
  const now = Date.now();
  const validItems = trash.items.filter(
    (ti: TrashItem) =>
      ti?.item &&
      ti?.deletedAt &&
      ti?.sourceListId &&
      now - ti.deletedAt < TRASH_WEEK_MS
  );
  return {
    items: validItems,
    position:
      trash.position && typeof trash.position.x === "number"
        ? trash.position
        : { x: 20, y: 60 },
    isCollapsed: trash.isCollapsed !== false,
    width: typeof trash.width === "number" ? trash.width : 280,
  };
}

const initialTrash: TrashListState = {
  items: [],
  position: { x: 20, y: 60 },
  isCollapsed: true,
  width: 280,
};

function createEmptyList(
  position: { x: number; y: number },
  type: "default" | "checklist" = "default"
): TodoList {
  return {
    id: crypto.randomUUID(),
    title: type === "checklist" ? "Новый чеклист" : "Новый список",
    type,
    items: [],
    position,
    isCollapsed: false,
    width: DEFAULT_LIST_WIDTH,
  };
}

function App() {
  const [lists, setLists] = useLocalStorage<TodoList[]>(
    STORAGE_KEY,
    [],
    migrateLists
  );
  const [trash, setTrash] = useLocalStorage<TrashListState>(
    TRASH_STORAGE_KEY,
    initialTrash,
    migrateTrash
  );
  const [filter, setFilter] = useState<"all" | "done" | "todo">("all");

  const handleMoveToTrash = (item: TodoItem, listId: string) => {
    setLists(
      lists.map((list) =>
        list.id === listId
          ? { ...list, items: list.items.filter((i) => i.id !== item.id) }
          : list
      )
    );
    setTrash((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { item, deletedAt: Date.now(), sourceListId: listId },
      ],
    }));
  };

  const handleRestoreFromTrash = (trashItem: TrashItem) => {
    const sourceExists = lists.some((l) => l.id === trashItem.sourceListId);
    if (!sourceExists) return;
    setLists(
      lists.map((list) =>
        list.id === trashItem.sourceListId
          ? { ...list, items: [...list.items, trashItem.item] }
          : list
      )
    );
    setTrash((prev) => ({
      ...prev,
      items: prev.items.filter((ti) => ti.item.id !== trashItem.item.id),
    }));
  };

  const handleAddList = (type: "default" | "checklist" = "default") => {
    const position = getNextListPosition(lists.length);
    setLists([...lists, createEmptyList(position, type)]);
  };

  const handleUpdateList = (updatedList: TodoList) => {
    setLists(
      lists.map((list) => (list.id === updatedList.id ? updatedList : list))
    );
  };

  const handleDeleteList = (id: string) => {
    setLists(lists.filter((list) => list.id !== id));
  };

  const STACK_OFFSET = 40;
  const handleCollapseAndStack = () => {
    setLists(
      lists.map((list, index) => ({
        ...list,
        isCollapsed: true,
        position: { x: 20, y: 20 + index * STACK_OFFSET },
      }))
    );
  };

  const handleUpdateTrash = (updated: TrashListState) => {
    setTrash(updated);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Списки дел</h1>
        <div className="app-header-actions">
          {(["all", "done", "todo"] as const).map((f) => (
            <button
              key={f}
              type="button"
              className="app-stack-btn"
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "Все" : f === "done" ? "Выполненные" : "Невыполненные"}
            </button>
          ))}
          <button
            type="button"
            className="app-stack-btn"
            onClick={handleCollapseAndStack}
            title="Свернуть все списки и разместить в левом верхнем углу"
          >
            Собрать списки
          </button>
          <AddListButton onClick={() => handleAddList("default")} label="Добавить список" />
          <AddListButton onClick={() => handleAddList("checklist")} label="Добавить чеклист" />
        </div>
      </header>
      <main className="app-main">
        {lists.map((list) => (
          <DraggableList
            key={list.id}
            list={list}
            filterCompleted={filter}
            onUpdate={handleUpdateList}
            onDelete={handleDeleteList}
            onMoveToTrash={handleMoveToTrash}
          />
        ))}
        <TrashList
          trash={trash}
          lists={lists}
          onUpdate={handleUpdateTrash}
          onRestore={handleRestoreFromTrash}
        />
      </main>
    </div>
  );
}

export default App;
