"use client"

import { useState, useRef, useContext } from "react";
import { AuthContext } from '@/context/AuthContext';
import useAxios from "@/hooks/useAxios";
import { useRouter } from "next/navigation";
import styles from './VerifyForm.module.css';
import AuthButton from "../Buttons/AuthButton";
import { Errors } from "@/types";
import { toast } from "react-toastify";

export default function VerifyForm() {
    const [errors, setErrors] = useState<Errors | []>([]);
    const [code, setCode] = useState<string []>(Array(6).fill(""));
    const { verifyEmail } = useContext(AuthContext);
    const inputRefs = Array(6).fill(null).map(() => useRef<HTMLInputElement>(null));
    
    const router = useRouter();



    const goBackInput = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {

        if (e.key === "Backspace") {
            let lengthBefore = code[index].length;

            // delete the input value
            let newCode = [...code];
            newCode[index] = "";
            setCode(newCode);

            // if on the first input, do nothing when trying to go back
            if (index === 0) {
                return;
            }

            // if the input is empty, focus on the previous input
            if (lengthBefore === 0) {
                inputRefs[index - 1].current?.focus();
            }

        } else if (e.key >= "0" && e.key <= "9") {

            let newCode = [...code];
            newCode[index] = e.key;
            setCode(newCode);

            // if on the last input, do nothing
            if (index === inputRefs.length - 1) {
                return;
            }

            inputRefs[index + 1].current?.focus();

        } else {
            // error has to be a number input
        }
    }

    async function handleSubmit() {
        setErrors([]);

        const errors = await verifyEmail(code.join(""));

        if (errors.length !== 0) {
            errors.forEach(({field, messages}) => {
                setErrors(errors => [...errors, {field, messages}]);
            });

            return;
        }

        toast.success("Email verified successfully");
        router.push("/login");


    }


    return (
        <div>
            
            <div className = {styles.codeInputContainer}>

                {/* 6 digit code cells */}
                {inputRefs.map((inputRef, index) => {
                    return (
                        <input
                            className = {styles.codeInput}
                            autoFocus={index === 0}
                            onKeyDown = {(e) => goBackInput(e, index)}
                            key={index}
                            ref={inputRef}
                            type="text"
                            maxLength={1}
                            size={1}
                            value={code[index]}
                        />
                    );
                })
                }

            </div>


            <button className = {styles.authButton} onClick={handleSubmit}>Verify</button>
                
            {/* Error message */}
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

        </div>
    )
}