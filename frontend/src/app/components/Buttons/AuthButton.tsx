import Link from 'next/link';
import styles from './AuthButton.module.css';

interface AuthButtonProps {
    text: string;
    link: string;
}

export default function AuthButton({text, link}: AuthButtonProps) {
    return (
        <button className = {styles.authButton} >
            <Link className = {styles.authButtonLink} href = {link}>{text}</Link>
        </button>
    );
}