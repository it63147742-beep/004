import styles from "./AddListButton.module.css";

interface AddListButtonProps {
  onClick: () => void;
}

export function AddListButton({ onClick }: AddListButtonProps) {
  return (
    <button type="button" className={styles.button} onClick={onClick}>
      + Добавить список
    </button>
  );
}
