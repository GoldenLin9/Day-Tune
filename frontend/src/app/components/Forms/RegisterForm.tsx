"use client"

import { useState, useContext } from "react";
import useAxios from '@/hooks/useAxios';
import { useRouter } from "next/navigation";
import { AuthContext } from '@/context/AuthContext';
import { toast } from "react-toastify";
import AuthInput from "@/app/components/Forms/AuthInput";
import AuthButton from "../Buttons/AuthButton";


type ErrorDetail = {
    field: string;
    messages: Array<string>;
};

type Errors = ErrorDetail[];

interface FormInfo {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    passwordConfirmation: string;
}

export default function RegisterForm() {
    const { register } = useContext(AuthContext);
    const router = useRouter();
    const [errors, setErrors] = useState<Errors | []>([]);
    const [formInfo, setFormInfo] = useState<FormInfo>({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        passwordConfirmation: ""
    });


    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();



        const registerErrors: Errors = await register(formInfo.firstName, formInfo.lastName, formInfo.email, formInfo.password, formInfo.passwordConfirmation);

        if (registerErrors.length !== 0) {

            registerErrors.forEach(({field, messages}) => {
                setErrors(errors => [...errors, {field, messages}]);
            });

            toast.error("Error creating account. Please try again");
            return;
        }

        toast.success("Account created successfully. Please check your email to continue");
        router.push("/verify-email");
        

    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setFormInfo({
            ...formInfo,
            [e.target.name]: e.target.value
        });
    }

    return (
        <form onSubmit={handleSubmit}>
            <AuthInput imageType="user" type="text" name="firstName" placeholder="First Name" value={formInfo.firstName} onChange={handleChange} />
            <AuthInput imageType="user" type="text" name="lastName" placeholder="Last Name" value={formInfo.lastName} onChange={handleChange} />
            <AuthInput imageType="email" type="email" name="email" placeholder="Email" value={formInfo.email} onChange={handleChange} />
            <AuthInput imageType="password" type="password" name="password" placeholder="Password" value={formInfo.password} onChange={handleChange} />
            <AuthInput imageType="password" type="password" name="passwordConfirmation" placeholder="Confirm Password" value={formInfo.passwordConfirmation} onChange={handleChange} />

            <AuthButton text={"Register"} link={"#"} />

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

    )
}