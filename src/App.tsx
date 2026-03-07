import { useRef } from "react";
import { DraggableList, getNextListPosition } from "./components/DraggableList/DraggableList";
import { AddListButton } from "./components/AddListButton";
import { FileMenu } from "./components/FileMenu/FileMenu";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { toFileData, fromFileData, downloadJson, readJsonFile } from "./utils/fileFormat";
import type { TodoList, TodoItem, Priority } from "./types";
import "./App.css";

const DEFAULT_PRIORITY: Priority = 3;
const DEFAULT_LIST_WIDTH = 280;

function migrateItem(item: Partial<TodoItem> & { id: string; text: string }): TodoItem {
  const p = item.priority;
  const priority: Priority =
    typeof p === "number" && p >= 1 && p <= 5 ? (p as Priority) : DEFAULT_PRIORITY;
  return { ...item, priority };
}

function migrateLists(lists: TodoList[]): TodoList[] {
  if (!Array.isArray(lists)) return [];
  return lists.map((list) => {
    const listWithWidth = list as TodoList & { width?: number };
    return {
      ...list,
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

function createEmptyList(position: { x: number; y: number }): TodoList {
  return {
    id: crypto.randomUUID(),
    title: "Новый список",
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    downloadJson(toFileData(lists));
  };

  const handleLoadClick = () => {
    fileInputRef.current?.click();
  };

  const handleLoadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const data = await readJsonFile(file);
    if (data) {
      const next = fromFileData(data);
      if (next.length) setLists(migrateLists(next));
    }
  };

  const handleTheme = () => {
    document.documentElement.classList.toggle("theme-light");
  };

  const handleHelp = () => {
    alert("Списки дел: перетаскивайте списки за шапку или края. Элементы — за иконку ⋮⋮. Файл → Сохранить/Загрузить — экспорт в JSON.");
  };

  const handleAddList = () => {
    const position = getNextListPosition(lists.length);
    setLists([...lists, createEmptyList(position)]);
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

  return (
    <div className="app">
      <header className="app-header">
        <h1>Списки дел</h1>
        <div className="app-header-actions">
          <FileMenu
            onSave={handleSave}
            onLoad={handleLoadClick}
            onTheme={handleTheme}
            onHelp={handleHelp}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="app-file-input"
            onChange={handleLoadFile}
            aria-hidden
          />
          <button
            type="button"
            className="app-stack-btn"
            onClick={handleCollapseAndStack}
            title="Свернуть все списки и разместить в левом верхнем углу"
          >
            Собрать списки
          </button>
          <AddListButton onClick={handleAddList} />
        </div>
      </header>
      <main className="app-main">
        {lists.map((list) => (
          <DraggableList
            key={list.id}
            list={list}
            onUpdate={handleUpdateList}
            onDelete={handleDeleteList}
          />
        ))}
      </main>
    </div>
  );
}

export default App;
