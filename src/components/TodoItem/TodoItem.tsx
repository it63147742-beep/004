import type { TodoItem as TodoItemType } from "../../types";
import styles from "./TodoItem.module.css";

interface TodoItemProps {
  item: TodoItemType;
  onDelete: (id: string) => void;
}

export function TodoItem({ item, onDelete }: TodoItemProps) {
  return (
    <li className={styles.item}>
      <span className={styles.text}>{item.text}</span>
      <button
        type="button"
        className={styles.deleteBtn}
        onClick={() => onDelete(item.id)}
        aria-label="Удалить"
      >
        ×
      </button>
    </li>
  );
}
