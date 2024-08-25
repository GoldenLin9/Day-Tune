"use client"

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import useAxios from "@/hooks/useAxios";
import AuthInput from "@/app/components/Forms/AuthInput";
import AuthButton from "../Buttons/AuthButton";
import Link from "next/link";
import styles from './LoginForm.module.css';
import { toast } from "react-toastify";
import { Errors } from "@/types";

type Error = string;

export function LoginForm() {

    const router = useRouter();
    const { user, userId, loading, login } = useAuth();

    const [errors, setErrors] = useState<Errors | []>([]);
    
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const axiosInstance = useAxios();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setErrors([]);

        const loginErrors: Errors = await login(email, password);


        if (loginErrors.length !== 0) {

            loginErrors.forEach(({field, messages}) => {
                setErrors(errors => [...errors, {field, messages}]);
            });

            toast.error("Error creating account. Please try again");
            return;
        }
        
        router.push("/dashboard");
    }

    function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
        setEmail(e.target.value);
    }

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    }


    return (
        <form onSubmit={handleSubmit}>

            <AuthInput imageType="email" type="email" name="email" placeholder="Email" value={email} onChange={handleEmailChange} />
            <AuthInput imageType="password" type="password" name="password" placeholder="Password" value={password} onChange={handlePasswordChange} />
            <Link className={styles.forgotPasswordLink} href="/forgot-password">Forgot password?</Link>
            <AuthButton text="Login" type = "submit" />

            {errors.map(({field, messages}) => {
                return (
                    <div key={field}>
                        <p>{field}</p>
                        <ul>
                            {messages.map((message, index) => {
                                return <li key={index}>{message}</li>
                            })}
                        </ul>
                    </div>
                )
            })}
        </form>
    )
}