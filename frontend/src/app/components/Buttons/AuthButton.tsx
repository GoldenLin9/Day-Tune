import Link from 'next/link';
import styles from './AuthButton.module.css';

interface AuthButtonProps {
    text: string;
    type: "button" | "submit" | "reset";
}

export default function AuthButton({text, type}: AuthButtonProps) {
    return (
        <button className = {styles.authButton} type = {type}>
            {text}
        </button>
    );
}