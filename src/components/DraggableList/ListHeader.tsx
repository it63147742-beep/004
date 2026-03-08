import styles from "./ListHeader.module.css";

interface ListHeaderProps {
  title: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onDelete: () => void;
  onTitleChange: (title: string) => void;
  completedCount?: number;
  totalCount?: number;
  isDragging?: boolean;
}

export function ListHeader({
  title,
  isCollapsed,
  onToggleCollapse,
  onDelete,
  onTitleChange,
  completedCount,
  totalCount,
  isDragging = false,
}: ListHeaderProps) {
  const showCounter =
    typeof completedCount === "number" &&
    typeof totalCount === "number" &&
    totalCount > 0;

  return (
    <>
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
      {showCounter && !isCollapsed && (
        <div
          className={`drag-handle ${styles.counterHandle}`}
          style={{ paddingLeft: "1.25rem" }}
        >
          Выполнено {completedCount} из {totalCount}
        </div>
      )}
    </>
  );
}
