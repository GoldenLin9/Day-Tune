"use client"

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import AuthInput from "./AuthInput";
import AuthButton from "../Buttons/AuthButton";
import { Errors } from "@/types";


const PasswordResetForm = () => {
    
    const [newPassword, setNewPassword] = useState("");
    const [newPasswordConfirmation, setNewPasswordConfirmation] = useState("");
    const [errors, setErrors] = useState<Errors | []>([]);

    const { resetPassword } = useAuth();
    const router = useRouter();
    const { uid, token } = useParams<{ uid: string, token: string }>();


    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setErrors([]);
        console.log("resetting password")

        const errors = await resetPassword(uid, token, newPassword, newPasswordConfirmation);

        if (errors.length !== 0) {
            errors.forEach(({field, messages}) => {
                setErrors(errors => [...errors, {field, messages}]);
            });

            toast.error("Error resetting password. Please try again");
            return;
        }


        toast.success("Password reset successfully");
        router.push("/login");
        
    }

    return (

        <form onSubmit={handleSubmit}>
            <AuthInput imageType="password" type="password" name="password" placeholder="Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <AuthInput imageType="password" type="password" name="passwordConfirmation" placeholder="Confirm Password" value={newPasswordConfirmation} onChange={(e) => setNewPasswordConfirmation(e.target.value)} />

            <AuthButton text="Reset Password" type = "submit" />

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

        
    );
}
export default PasswordResetForm;