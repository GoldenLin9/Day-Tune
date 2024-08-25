"use client"

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import useAxios from "@/hooks/useAxios";
import AuthInput from "./AuthInput";
import AuthButton from "../Buttons/AuthButton";
import Link from "next/link";
import styles from './LoginForm.module.css';

type Error = string;

export function LoginForm() {

    const router = useRouter();
    const { user, userId, loading, login } = useAuth();

    const [error, setError] = useState<string | null>(null);
    
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const axiosInstance = useAxios();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const error = await login(email, password);


        if (error != null) {
            setError(error);
            return;
        }
        
        router.push("/dashboard");
    }

    function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
        setEmail(e.target.value);
    }


    return (
        <form onSubmit={handleSubmit}>

            <AuthInput imageType="email" type="email" name="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <AuthInput imageType="password" type="password" name="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Link className={styles.forgotPasswordLink} href="/forgot-password">Forgot password?</Link>
            <AuthButton text="Login" link="#" />

            {error && <p>{error}</p>}
        </form>
    )
}