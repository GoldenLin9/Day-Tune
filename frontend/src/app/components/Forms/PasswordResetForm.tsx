"use client"

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import AuthInput from "./AuthInput";
import AuthButton from "../Buttons/AuthButton";


const PasswordResetForm = () => {
    
    const [newPassword, setNewPassword] = useState("");
    const [newPasswordConfirmation, setNewPasswordConfirmation] = useState("");
    const [errorArray, setErrorArray] = useState<JSX.Element[]>([]);

    const { resetPassword } = useAuth();
    const router = useRouter();
    const { uid, token } = useParams<{ uid: string, token: string }>();


    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        setErrorArray([]);
        e.preventDefault();

        const error = await resetPassword(uid, token, newPassword, newPasswordConfirmation);

        if (error != null) {

            Object.entries(error).map(([errorType, errors], index) => {
                setErrorArray(errorArray => [...errorArray, <p key={index}>{errorType}: {errors.join(", ")}</p>]);
            });

            return;
        }


        toast.success("Password reset successfully");
        router.push("/login");
        
    }

    return (

        <form onSubmit={handleSubmit}>
            <AuthInput imageType="password" type="password" name="password" placeholder="Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <AuthInput imageType="password" type="password" name="passwordConfirmation" placeholder="Confirm Password" value={newPasswordConfirmation} onChange={(e) => setNewPasswordConfirmation(e.target.value)} />

            <AuthButton text="Reset Password" link="#" />

            {errorArray}
        </form>

        
    );
}
export default PasswordResetForm;