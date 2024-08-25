import PasswordResetForm from '@/app/components/Forms/PasswordResetForm';
import styles from '@/app/(authorization)/authForms.module.css';
import Link from 'next/link';


const PasswordResetPage = () => {

    return (
        <>
            <h1 className={styles.authTypeHeader}>Reset Password</h1>

            <p className={styles.authHelpText}>Enter your new password</p>

            <PasswordResetForm />

            <p className={styles.authAltText}>Remember your password? Go to the <Link className={styles.authAltLink} href="/login">Login page</Link></p>

        </>
    );
}
export default PasswordResetPage;