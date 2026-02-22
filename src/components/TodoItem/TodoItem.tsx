import type { TodoItem as TodoItemType, Priority } from "../../types";
import styles from "./TodoItem.module.css";

interface TodoItemProps {
  item: TodoItemType;
  onDelete: (id: string) => void;
  onPriorityChange: (id: string, priority: Priority) => void;
}

const PRIORITIES: Priority[] = [1, 2, 3, 4, 5];

export function TodoItem({ item, onDelete, onPriorityChange }: TodoItemProps) {
  return (
    <div
      className={`${styles.item} ${styles[`priority${item.priority}`]}`}
      data-priority={item.priority}
    >
      <span className={styles.text}>{item.text}</span>
      <div className={styles.actions}>
        <div className={styles.priorityBtns} role="group" aria-label="Приоритет">
          {PRIORITIES.map((p) => (
            <button
              key={p}
              type="button"
              className={`${styles.priorityBtn} ${item.priority === p ? styles.priorityBtnActive : ""}`}
              onClick={() => onPriorityChange(item.id, p)}
              aria-pressed={item.priority === p}
              aria-label={`Приоритет ${p}`}
              title={`Приоритет ${p}`}
            >
              {p}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={styles.deleteBtn}
          onClick={() => onDelete(item.id)}
          aria-label="Удалить"
        >
          ×
        </button>
      </div>
    </div>
  );
}
