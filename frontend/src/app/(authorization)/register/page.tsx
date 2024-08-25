import RegisterForm from '@/app/components/Forms/RegisterForm';
import styles from '../authForms.module.css';
import Link from 'next/link';

export default function RegisterPage() {

    return (
        <>
        
            <h1 className={styles.authTypeHeader}>Register</h1>
            <p className={styles.authHelpText} >Create an account to continue</p>
            <RegisterForm />
            <p className={styles.authAltText} >Already have an account? Go to the <Link className={styles.authAltLink} href="/login">Login page</Link></p>
        </>

    );
}
