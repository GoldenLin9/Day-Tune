import ForgotPasswordForm from "@/app/components/Forms/ForgotPasswordForm";
import styles from '../authForms.module.css';
import Link from 'next/link';


const ForgotPasswordPage = () => {

    return (
        <>
            <h1 className={styles.authTypeHeader}>Forgot Password</h1>
            <p className={styles.authHelpText} >Enter your email to reset your password</p>
            <ForgotPasswordForm />
            <p className={styles.authAltText} >Remember your password? Go to the <Link className={styles.authAltLink} href="/login">Login page</Link></p>
        </>
    );
}

export default ForgotPasswordPage;