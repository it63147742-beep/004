import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TodoItem } from "./TodoItem";
import type { TodoItem as TodoItemType, Priority } from "../../types";
import styles from "./SortableTodoItem.module.css";

interface SortableTodoItemProps {
  item: TodoItemType;
  onDelete: (id: string) => void;
  onPriorityChange: (id: string, priority: Priority) => void;
}

export function SortableTodoItem({
  item,
  onDelete,
  onPriorityChange,
}: SortableTodoItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`${styles.sortableItem} ${isDragging ? styles.dragging : ""}`}
    >
      <div className={styles.dragHandle} {...attributes} {...listeners}>
        ⋮⋮
      </div>
      <div className={styles.itemContent}>
        <TodoItem
          item={item}
          onDelete={onDelete}
          onPriorityChange={onPriorityChange}
        />
      </div>
    </li>
  );
}
