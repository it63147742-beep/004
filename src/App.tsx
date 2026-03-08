import { useState } from "react";
import { DraggableList, getNextListPosition } from "./components/DraggableList/DraggableList";
import { TrashList } from "./components/TrashList/TrashList";
import { AddListButton } from "./components/AddListButton";
import { useLocalStorage } from "./hooks/useLocalStorage";
import type { TodoList, TodoItem, Priority, TrashItem } from "./types";
import "./App.css";

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
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function migrateTrash(items: TrashItem[]): TrashItem[] {
  if (!Array.isArray(items)) return [];
  const now = Date.now();
  return items.filter((item) => now - (item.deletedAt ?? 0) < SEVEN_DAYS_MS);
}

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
  const [trash, setTrash] = useLocalStorage<TrashItem[]>(
    TRASH_STORAGE_KEY,
    [],
    migrateTrash
  );
  const [filter, setFilter] = useState<"all" | "done" | "todo">("all");

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

  const cleanExpiredTrash = (items: TrashItem[]) =>
    items.filter((item) => Date.now() - item.deletedAt < SEVEN_DAYS_MS);

  const handleMoveToTrash = (listId: string, list: TodoList, item: TodoItem) => {
    const trashItem: TrashItem = {
      ...item,
      deletedAt: Date.now(),
      sourceListId: listId,
      sourceListTitle: list.title,
      sourceListType: list.type,
    };
    setTrash((prev) => cleanExpiredTrash([...prev, trashItem]));
    setLists(
      lists.map((l) =>
        l.id === listId ? { ...l, items: l.items.filter((i) => i.id !== item.id) } : l
      )
    );
  };

  const handleRestoreFromTrash = (trashItem: TrashItem) => {
    const { deletedAt, sourceListId, sourceListTitle, sourceListType, ...item } = trashItem;
    const targetList = lists.find((l) => l.id === sourceListId);
    if (targetList) {
      setLists(
        lists.map((l) =>
          l.id === sourceListId
            ? { ...l, items: [...l.items, item as TodoItem] }
            : l
        )
      );
    } else {
      const position = getNextListPosition(lists.length);
      setLists([
        ...lists,
        {
          id: crypto.randomUUID(),
          title: sourceListTitle ?? "Восстановленный список",
          type: sourceListType ?? "default",
          items: [item as TodoItem],
          position,
          isCollapsed: false,
          width: DEFAULT_LIST_WIDTH,
        },
      ]);
    }
    setTrash((prev) => cleanExpiredTrash(prev.filter((i) => i.id !== trashItem.id)));
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
          items={trash}
          onRestore={handleRestoreFromTrash}
          onUpdateExpanded={() => {}}
          defaultCollapsed={true}
        />
      </main>
    </div>
  );
}

export default App;
