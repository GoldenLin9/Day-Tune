"use client"

import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { toast } from "react-toastify";

const ForgotPasswordPage = () => {
    
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
        <div>
            <h1>Forgot Password</h1>

            <form onSubmit={handleSubmit}>
                <label htmlFor="email">Email</label>
                <input type="email" name="email" id="email" value={email} onChange={e => setEmail(e.target.value)} />

                <button type="submit">Submit</button>
            </form>
            {error && <p>{error}</p>}
        </div>
    );
}

export default ForgotPasswordPage;