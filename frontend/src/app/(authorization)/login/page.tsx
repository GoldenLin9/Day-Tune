
import { LoginForm } from '@/app/components/Forms/LoginForm';
import { SocialButton } from '@/app/components/Buttons/SocialAuth';
import styles from '../authForms.module.css';
import Link from 'next/link';

export default function LoginPage() {
    return (
        <>
            <h1 className={styles.authTypeHeader}>Login</h1>
            <p className={styles.authHelpText}>Please sign in to continue</p>
            <SocialButton type = "Google" provider = "google-oauth2" callbackUrl='/dashboard'/>
            <p className = {styles.borderLine}>or</p>
            <LoginForm />
            <p className={styles.authAltText}>Don&rsquo;t have an account? Please <Link className={styles.authAltLink} href="/register">Register</Link> first</p>
        </>
        
    )
}