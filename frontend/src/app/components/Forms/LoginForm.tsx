"use client"

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { jwtDecode } from "jwt-decode";
// import cookie from 'cookie';
import Cookie from 'js-cookie';
import useAxios from "@/hooks/useAxios";


export function LoginForm() {

    const router = useRouter();
    const { setAccessToken, setRefreshToken, setUser } = useAuth();
    const [error, setError] = useState<string | null>(null);
    
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const axiosInstance = useAxios();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        axiosInstance.post("api/jwt/create/", {
            email: email,
            password: password
        }).then(async (response) => {

            if (response.status === 200) {
                setAccessToken(response.data.access);
                setRefreshToken(response.data.refresh);
                Cookie.set("access", response.data.access);
                Cookie.set("refresh", response.data.refresh);

                await axiosInstance.get("/api/users/me")
                .then((response) => {
                    setUser(response.data);
                }).catch((error) => {
                    console.error(error);
                })


                router.push("/dashboard");
            }
        
        }).catch((error) => {
            
        })
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