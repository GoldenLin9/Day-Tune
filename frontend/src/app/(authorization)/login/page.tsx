
import { LoginForm } from '@/app/components/Forms/LoginForm';
import { SocialButton } from '@/app/components/Buttons/SocialAuth';

export default function LoginPage() {
    return (
        <div>
            <h1>Login</h1>

            <SocialButton type = "Google" provider = "google-oauth2" callbackUrl='/dashboard'/>

            <p>or</p>
            <LoginForm />
        </div>
    )
}