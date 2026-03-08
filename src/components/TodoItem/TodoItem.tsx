import type { TodoItem as TodoItemType, Priority } from "../../types";
import styles from "./TodoItem.module.css";

interface TodoItemProps {
  item: TodoItemType;
  onDelete: (id: string) => void;
  onPriorityChange: (id: string, priority: Priority) => void;
  onToggleComplete?: (id: string) => void;
}

const PRIORITIES: Priority[] = [1, 2, 3, 4, 5];

export function TodoItem({ item, onDelete, onPriorityChange, onToggleComplete }: TodoItemProps) {
  const isChecklist = typeof onToggleComplete === "function";

  const priorityClass = isChecklist ? "" : styles[`priority${item.priority}`];
  return (
    <div
      className={`${styles.item} ${priorityClass} ${item.completed ? styles.completed : ""}`}
      data-priority={isChecklist ? undefined : item.priority}
    >
      {isChecklist ? (
        <label className={styles.checkablePart}>
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={Boolean(item.completed)}
            onChange={() => onToggleComplete?.(item.id)}
            aria-label={item.completed ? "Отметить невыполненным" : "Отметить выполненным"}
          />
          <span className={styles.text}>{item.text}</span>
        </label>
      ) : (
        <span className={styles.text}>{item.text}</span>
      )}
      <div className={styles.actions}>
        {!isChecklist && (
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
        )}
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
