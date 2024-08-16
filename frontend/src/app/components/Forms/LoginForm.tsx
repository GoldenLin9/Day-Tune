"use client"

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import useAxios from "@/hooks/useAxios";

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
            <label>
                Email
                <input name="email" type="email" onChange = {handleEmailChange} />
            </label>
            <label>
                Password
                <input name="password" type="password" onChange = { (e) => setPassword(e.target.value)} />
            </label>
            <button>Sign In</button>
            {error && <p>{error}</p>}
        </form>
    )
}