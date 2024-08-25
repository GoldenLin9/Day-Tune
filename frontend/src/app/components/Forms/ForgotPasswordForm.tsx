"use client"

import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { toast } from "react-toastify";

import AuthInput from "./AuthInput";
import AuthButton from "../Buttons/AuthButton";

const ForgotPasswordForm = () => {

    const [email, setEmail] = useState("");
    const [error, setError] = useState("");

    const { forgotPassword } = useAuth();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const error = await forgotPassword(email);

        if (error != null) {
            setError(error);
            return;
        }

        toast.success("Password reset email sent. Please check your email");
    }

    return (
        <>
            <form onSubmit={handleSubmit}>
                <AuthInput imageType="email" type="email" name="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <AuthButton text="Send Reset Email" link="#" />
            </form>
            {error && <p>{error}</p>}
        </>
    )
};

export default ForgotPasswordForm;