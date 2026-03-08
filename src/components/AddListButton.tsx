import styles from "./AddListButton.module.css";

interface AddListButtonProps {
  onClick: () => void;
  label: string;
}

export function AddListButton({ onClick, label }: AddListButtonProps) {
  return (
    <button type="button" className={styles.button} onClick={onClick}>
      + {label}
    </button>
  );
}
