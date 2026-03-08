import { useState } from "react";
import { ListHeader } from "../DraggableList/ListHeader";
import type { TrashItem } from "../../types";
import styles from "./TrashList.module.css";

interface TrashListProps {
  items: TrashItem[];
  onRestore: (item: TrashItem) => void;
  onUpdateExpanded: (expanded: boolean) => void;
  defaultCollapsed?: boolean;
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export function TrashList({
  items,
  onRestore,
  onUpdateExpanded,
  defaultCollapsed = true,
}: TrashListProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const handleToggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    onUpdateExpanded(!next);
  };

  const validItems = items.filter(
    (item) => Date.now() - item.deletedAt < SEVEN_DAYS_MS
  );

  const title = `Корзина${validItems.length > 0 ? ` (${validItems.length})` : ""}`;

  return (
    <div className={styles.wrapper}>
      <div className={styles.list}>
        <ListHeader
          title={title}
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggleCollapse}
          onTitleChange={() => {}}
          hideDelete
          readOnlyTitle
        />
        {!isCollapsed && (
          <div className={styles.content}>
            {validItems.length === 0 ? (
              <p className={styles.emptyMessage}>Корзина пуста</p>
            ) : (
              <ul className={styles.items}>
                {validItems.map((item) => (
                  <li key={item.id} className={styles.trashItem}>
                    <span className={styles.itemText} title={item.text}>
                      {item.text}
                    </span>
                    {item.sourceListTitle && (
                      <span className={styles.sourceHint}>
                        из «{item.sourceListTitle}»
                      </span>
                    )}
                    <button
                      type="button"
                      className={styles.restoreBtn}
                      onClick={() => onRestore(item)}
                      aria-label="Восстановить"
                      title="Восстановить в список"
                    >
                      ↶ Восстановить
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
