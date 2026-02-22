import { DraggableList, getNextListPosition } from "./components/DraggableList/DraggableList";
import { AddListButton } from "./components/AddListButton";
import { useLocalStorage } from "./hooks/useLocalStorage";
import type { TodoList } from "./types";
import "./App.css";

const STORAGE_KEY = "todo-lists";

function createEmptyList(position: { x: number; y: number }): TodoList {
  return {
    id: crypto.randomUUID(),
    title: "Новый список",
    items: [],
    position,
    isCollapsed: false,
  };
}

function App() {
  const [lists, setLists] = useLocalStorage<TodoList[]>(STORAGE_KEY, []);

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

  return (
    <div className="app">
      <header className="app-header">
        <h1>Списки дел</h1>
        <AddListButton onClick={handleAddList} />
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
