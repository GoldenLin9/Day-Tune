"use client"

import { useState, useRef, useContext } from "react";
import { AuthContext } from '@/context/AuthContext';
import useAxios from "@/hooks/useAxios";
import { useRouter } from "next/navigation";

export default function VerifyForm() {
    const [error, setError] = useState("");
    const [code, setCode] = useState(Array(6).fill(""));
    const { verifyEmail } = useContext(AuthContext);
    const [inputRefs, setInputRefs] = useState([
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
    ]);
    
    const router = useRouter();

    const axiosInstance = useAxios();

    const goNextInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const target = e.target;
        const inputIndex = inputRefs.findIndex((inputRef) => inputRef.current === target);
        
        let newCode = [...code];
        newCode[inputIndex] = target.value;
        setCode(newCode);



        if (inputIndex === inputRefs.length - 1) {
            return;
        }

        if (target.value.length > 0) {
            inputRefs[inputIndex + 1].current?.focus();
        }
    };

    const inputs = inputRefs.map((inputRef, index) => {
        return (
            <input
                autoFocus={index === 0}

                onChange = {goNextInput}
                key={index}
                ref={inputRef}
                type="text"
                maxLength={1}
                size={1}
                placeholder="-"
            />
        );
    });

    async function handleSubmit() {

        const error = await verifyEmail(code.join(""));

        if (error != null) {
            setError(error);
            return;
        }

        router.push("/login");

    }

    return (
        <div>
            
            {/* 6 digit code cells */}
            {inputs}
            
            {/* Verify button */}
            <button onClick={handleSubmit}>Verify</button>


            {/* Resend code button */}
            <button>Resend code (does nothing)</button>
                
            {/* Error message */}
            {error && <p>{error}</p>}
        </div>
    )
}