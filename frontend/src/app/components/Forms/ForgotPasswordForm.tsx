"use client"

import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { toast } from "react-toastify";

import AuthInput from "./AuthInput";
import AuthButton from "../Buttons/AuthButton";

import { Errors } from "@/types";

const ForgotPasswordForm = () => {

    const [email, setEmail] = useState("");
    const [errors, setErrors] = useState<Errors | []>([]);

    const { forgotPassword } = useAuth();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setErrors([]);

        const errors = await forgotPassword(email);

        if (errors.length !== 0) {
            errors.forEach(({field, messages}) => {
                setErrors(errors => [...errors, {field, messages}]);
            });

            toast.error("Error sending reset email. Please try again");
            return;
        }


        toast.success("Password reset email sent. Please check your email");
    }

    return (
        <>
            <form onSubmit={handleSubmit}>
                <AuthInput imageType="email" type="email" name="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <AuthButton text="Send Reset Email" type = "submit" />
            </form>
            
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
        </>
    )
};

export default ForgotPasswordForm;