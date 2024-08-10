"use client"

import { useState, useRef, useContext } from "react";
import { AuthContext } from '@/context/AuthContext';
import useAxios from "@/hooks/useAxios";
import { useRouter } from "next/navigation";

export default function VerifyForm() {
    const [error, setError] = useState("");
    const [code, setCode] = useState(Array(6).fill(""));
    const { userId } = useContext(AuthContext);
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
    console.log("userId", userId);

    const goNextInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const target = e.target;
        const inputIndex = inputRefs.findIndex((inputRef) => inputRef.current === target);
        
        console.log("JUST EDITED: ", target.value);
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
            />
        );
    });

    function handleSubmit() {

        
        axiosInstance.post("/api/verify-email/", { 
            userId: userId,
            code: code.join("")
        }).then((res) => {
            console.log(res.data);
            router.push("/login");
        }) .catch((error) => {
            console.log(error.response.data.message);
            setError(error.response.data.message);
        });

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