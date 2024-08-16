"use client"


import { useParams } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";


const PasswordResetPage = () => {

    const { uid, token } = useParams<{ uid: string, token: string }>();
    const [newPassword, setNewPassword] = useState("");
    const [newPasswordConfirmation, setNewPasswordConfirmation] = useState("");
    const [errorArray, setErrorArray] = useState<JSX.Element[]>([]);

    const { resetPassword } = useAuth();
    const router = useRouter();


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
        <div>
            <h1>Enter a new password</h1>

            <form onSubmit={handleSubmit}>
                <label htmlFor="password">Password</label>
                <input type="password" name="password" id="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />

                <label htmlFor="passwordConfirmation">Confirm Password</label>
                <input type="password" name="passwordConfirmation" id="passwordConfirmation" value={newPasswordConfirmation} onChange={e => setNewPasswordConfirmation(e.target.value)} />

                <button type="submit">Submit</button>

                {errorArray}
            </form>
        </div>
    );
}
export default PasswordResetPage;