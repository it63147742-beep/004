import styles from "./ListHeader.module.css";

interface ListHeaderProps {
  title: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onDelete: () => void;
  onTitleChange: (title: string) => void;
  isDragging?: boolean;
}

export function ListHeader({
  title,
  isCollapsed,
  onToggleCollapse,
  onDelete,
  onTitleChange,
  isDragging = false,
}: ListHeaderProps) {
  return (
    <div className={`drag-handle ${styles.header} ${isDragging ? styles.dragging : ""}`}>
      <input
        type="text"
        className={styles.titleInput}
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="Название списка"
      />
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.iconBtn}
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? "Развернуть" : "Свернуть"}
          title={isCollapsed ? "Развернуть" : "Свернуть"}
        >
          {isCollapsed ? "▼" : "▲"}
        </button>
        <button
          type="button"
          className={styles.iconBtn}
          onClick={onDelete}
          aria-label="Удалить список"
          title="Удалить список"
        >
          🗑
        </button>
      </div>
    </div>
  );
}
