import { useRef } from "react";
import Draggable from "react-draggable";
import type { TrashItem as TrashItemType, TodoList } from "../../types";
import { ListHeader } from "../DraggableList/ListHeader";
import styles from "./TrashList.module.css";

export interface TrashListState {
  items: TrashItemType[];
  position: { x: number; y: number };
  isCollapsed: boolean;
  width: number;
}

interface TrashListProps {
  trash: TrashListState;
  lists: TodoList[];
  onUpdate: (trash: TrashListState) => void;
  onRestore: (trashItem: TrashItemType) => void;
}

export function TrashList({
  trash,
  lists,
  onUpdate,
  onRestore,
}: TrashListProps) {
  const nodeRef = useRef<HTMLDivElement>(null);

  const handleDragStop = (_: unknown, data: { x: number; y: number }) => {
    onUpdate({ ...trash, position: { x: data.x, y: data.y } });
  };

  const handleToggleCollapse = () => {
    onUpdate({ ...trash, isCollapsed: !trash.isCollapsed });
  };

  const getSourceListInfo = (sourceListId: string) => {
    const list = lists.find((l) => l.id === sourceListId);
    return {
      title: list?.title ?? "Удалённый список",
      exists: !!list,
    };
  };

  if (trash.items.length === 0) return null;

  return (
    <Draggable
      nodeRef={nodeRef}
      position={trash.position}
      onStop={handleDragStop}
      handle=".drag-handle"
      bounds="parent"
    >
      <div
        ref={nodeRef}
        className={styles.wrapper}
        style={{ position: "absolute" }}
      >
        <div className={styles.list} style={{ width: trash.width }}>
          <ListHeader
            title={`Корзина (${trash.items.length})`}
            isCollapsed={trash.isCollapsed}
            onToggleCollapse={handleToggleCollapse}
            onDelete={() => {}}
            onTitleChange={() => {}}
            hideDelete
          />
          {!trash.isCollapsed && (
            <div className={styles.content}>
              <ul className={styles.items}>
                {trash.items.map((ti) => {
                  const { title, exists } = getSourceListInfo(ti.sourceListId);
                  return (
                    <li key={ti.item.id} className={styles.trashItem}>
                      <span className={styles.text}>{ti.item.text}</span>
                      <span
                        className={
                          exists ? styles.source : styles.sourceDeleted
                        }
                      >
                        {title}
                      </span>
                      <button
                        type="button"
                        className={styles.restoreBtn}
                        onClick={() => onRestore(ti)}
                        disabled={!exists}
                        aria-label="Восстановить"
                        title={
                          exists
                            ? "Восстановить в исходный список"
                            : "Исходный список удалён, восстановление невозможно"
                        }
                      >
                        ↩ Восстановить
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          <div className={`drag-handle ${styles.edgeHandle} ${styles.edgeHandleLeft}`} />
          <div className={`drag-handle ${styles.edgeHandle} ${styles.edgeHandleBottom}`} />
        </div>
      </div>
    </Draggable>
  );
}
