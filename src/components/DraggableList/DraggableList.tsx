import { useRef } from "react";
import Draggable from "react-draggable";
import type { TodoList as TodoListType } from "../../types";
import { ListHeader } from "./ListHeader";
import { TodoItem } from "../TodoItem/TodoItem";
import styles from "./DraggableList.module.css";

interface DraggableListProps {
  list: TodoListType;
  onUpdate: (list: TodoListType) => void;
  onDelete: (id: string) => void;
}

const OFFSET_STEP = 30;

export function DraggableList({ list, onUpdate, onDelete }: DraggableListProps) {
  const nodeRef = useRef<HTMLDivElement>(null);

  const handleDragStop = (_: unknown, data: { x: number; y: number }) => {
    onUpdate({ ...list, position: { x: data.x, y: data.y } });
  };

  const handleToggleCollapse = () => {
    onUpdate({ ...list, isCollapsed: !list.isCollapsed });
  };

  const handleTitleChange = (title: string) => {
    onUpdate({ ...list, title });
  };

  const handleAddItem = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    if (e.key === "Enter" && input.value.trim()) {
      const newItem = {
        id: crypto.randomUUID(),
        text: input.value.trim(),
      };
      onUpdate({
        ...list,
        items: [...list.items, newItem],
      });
      input.value = "";
    }
  };

  const handleDeleteItem = (itemId: string) => {
    onUpdate({
      ...list,
      items: list.items.filter((i) => i.id !== itemId),
    });
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      position={list.position}
      onStop={handleDragStop}
      handle=".drag-handle"
      bounds="parent"
    >
      <div ref={nodeRef} className={styles.wrapper} style={{ position: "absolute" }}>
        <div className={`drag-handle ${styles.list}`}>
          <ListHeader
            title={list.title}
            isCollapsed={list.isCollapsed}
            onToggleCollapse={handleToggleCollapse}
            onDelete={() => onDelete(list.id)}
            onTitleChange={handleTitleChange}
          />
          {!list.isCollapsed && (
            <div className={styles.content}>
              <ul className={styles.items}>
                {list.items.map((item) => (
                  <TodoItem key={item.id} item={item} onDelete={handleDeleteItem} />
                ))}
              </ul>
              <input
                type="text"
                className={styles.input}
                placeholder="Добавить задачу... (Enter)"
                onKeyDown={handleAddItem}
              />
            </div>
          )}
        </div>
      </div>
    </Draggable>
  );
}

export function getNextListPosition(listsCount: number): { x: number; y: number } {
  return {
    x: 20 + (listsCount % 5) * OFFSET_STEP,
    y: 20 + Math.floor(listsCount / 5) * OFFSET_STEP,
  };
}
