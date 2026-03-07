import { useRef, useEffect, useState } from "react";
import styles from "./FileMenu.module.css";

export interface FileMenuProps {
  onSave: () => void;
  onLoad: () => void;
  onTheme: () => void;
  onHelp: () => void;
}

export function FileMenu({ onSave, onLoad, onTheme, onHelp }: FileMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [open]);

  return (
    <div className={styles.wrapper} ref={menuRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        Файл
      </button>
      {open && (
        <menu className={styles.dropdown} role="menu">
          <li role="none">
            <button type="button" role="menuitem" onClick={() => { onSave(); setOpen(false); }}>
              Сохранить
            </button>
          </li>
          <li role="none">
            <button type="button" role="menuitem" onClick={() => { onLoad(); setOpen(false); }}>
              Загрузить
            </button>
          </li>
          <li role="none">
            <button type="button" role="menuitem" onClick={() => { onTheme(); setOpen(false); }}>
              Тема
            </button>
          </li>
          <li role="none">
            <button type="button" role="menuitem" onClick={() => { onHelp(); setOpen(false); }}>
              Помощь
            </button>
          </li>
        </menu>
      )}
    </div>
  );
}
