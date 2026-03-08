import { useRef, useState, useCallback, useEffect } from "react";
import Draggable from "react-draggable";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import type { TodoList as TodoListType } from "../../types";
import { TodoItem } from "../TodoItem/TodoItem";
import { ListHeader } from "./ListHeader";
import { SortableTodoItem } from "../TodoItem/SortableTodoItem";
import styles from "./DraggableList.module.css";

interface DraggableListProps {
  list: TodoListType;
  filterCompleted?: "all" | "done" | "todo";
  onUpdate: (list: TodoListType) => void;
  onDelete: (id: string) => void;
  onMoveToTrash?: (item: import("../../types").TodoItem, listId: string) => void;
}

const OFFSET_STEP = 30;
const MIN_LIST_WIDTH = 200;
const MAX_LIST_WIDTH = 500;

export function DraggableList({
  list,
  filterCompleted = "all",
  onUpdate,
  onDelete,
  onMoveToTrash,
}: DraggableListProps) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const listRef = useRef(list);
  listRef.current = list;

  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const handleResizeStart = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      setIsResizing(true);
      startXRef.current = e.clientX;
      startWidthRef.current = list.width;
    },
    [list.width]
  );

  useEffect(() => {
    if (!isResizing) return;

    const handlePointerMove = (e: PointerEvent) => {
      const deltaX = e.clientX - startXRef.current;
      const newWidth = Math.min(
        MAX_LIST_WIDTH,
        Math.max(MIN_LIST_WIDTH, startWidthRef.current + deltaX)
      );
      onUpdate({ ...listRef.current, width: newWidth });
    };

    const handlePointerUp = () => {
      setIsResizing(false);
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
    document.addEventListener("pointercancel", handlePointerUp);

    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [isResizing, onUpdate]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

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
        priority: 3 as const,
        completed: list.type === "checklist" ? false : undefined,
      };
      onUpdate({
        ...list,
        items: [...list.items, newItem],
      });
      input.value = "";
    }
  };

  const handleDeleteItem = (itemId: string) => {
    const item = list.items.find((i) => i.id === itemId);
    if (item && onMoveToTrash) {
      onMoveToTrash(item, list.id);
    } else {
      onUpdate({
        ...list,
        items: list.items.filter((i) => i.id !== itemId),
      });
    }
  };

  const handlePriorityChange = (itemId: string, priority: 1 | 2 | 3 | 4 | 5) => {
    onUpdate({
      ...list,
      items: list.items.map((i) =>
        i.id === itemId ? { ...i, priority } : i
      ),
    });
  };

  const handleToggleComplete = (itemId: string) => {
    onUpdate({
      ...list,
      items: list.items.map((i) =>
        i.id === itemId ? { ...i, completed: !i.completed } : i
      ),
    });
  };

  const isFiltered =
    list.type === "checklist" && filterCompleted !== "all";
  const visibleItems = isFiltered
    ? list.items.filter((i) =>
        filterCompleted === "done" ? i.completed : !i.completed
      )
    : list.items;

  const handleSortEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = list.items.findIndex((i) => i.id === active.id);
    const newIndex = list.items.findIndex((i) => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const newItems = arrayMove(list.items, oldIndex, newIndex);
    onUpdate({ ...list, items: newItems });
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
        <div
          className={styles.list}
          style={{ width: list.width }}
        >
          <ListHeader
            title={list.title}
            isCollapsed={list.isCollapsed}
            onToggleCollapse={handleToggleCollapse}
            onDelete={() => onDelete(list.id)}
            onTitleChange={handleTitleChange}
          />
          {!list.isCollapsed && (
            <div className={styles.content}>
              {isFiltered ? (
                <ul className={styles.items}>
                  {visibleItems.map((item) => (
                    <li key={item.id}>
                      <TodoItem
                        item={item}
                        onDelete={handleDeleteItem}
                        onPriorityChange={handlePriorityChange}
                        onToggleComplete={handleToggleComplete}
                      />
                    </li>
                  ))}
                </ul>
              ) : (
              <DndContext
                id={list.id}
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleSortEnd}
              >
                <SortableContext
                  items={list.items.map((i) => i.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <ul className={styles.items}>
                    {list.items.map((item) => (
                      <SortableTodoItem
                        key={item.id}
                        item={item}
                        onDelete={handleDeleteItem}
                        onPriorityChange={handlePriorityChange}
                        onToggleComplete={
                          list.type === "checklist" ? handleToggleComplete : undefined
                        }
                      />
                    ))}
                  </ul>
                </SortableContext>
              </DndContext>
              )}
              <input
                type="text"
                className={styles.input}
                placeholder="Добавить задачу... (Enter)"
                onKeyDown={handleAddItem}
              />
            </div>
          )}
          <div
            className={styles.resizeHandle}
            onPointerDown={handleResizeStart}
            aria-label="Изменить ширину"
            title="Потяните для изменения ширины"
          />
          <div className={`drag-handle ${styles.edgeHandle} ${styles.edgeHandleLeft}`} />
          <div className={`drag-handle ${styles.edgeHandle} ${styles.edgeHandleBottom}`} />
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
