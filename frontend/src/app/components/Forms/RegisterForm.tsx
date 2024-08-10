"use client"

import { useState, useContext } from "react";
import useAxios from '@/hooks/useAxios';
import { useRouter } from "next/navigation";
import { AuthContext } from '@/context/AuthContext';
import { toast } from "react-toastify";


interface FormInfo {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    passwordConfirmation: string;
}

export default function RegisterForm() {
    const { setUserId } = useContext(AuthContext);
    const router = useRouter();
    const [errors, setErrors] = useState<string[]>([]);
    const [formInfo, setFormInfo] = useState<FormInfo>({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        passwordConfirmation: ""
    });

    const axiosInstance = useAxios();

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        let data = {
            first_name: formInfo.firstName,
            last_name: formInfo.lastName,
            email: formInfo.email,
            password: formInfo.password,
            re_password: formInfo.passwordConfirmation
        }

        axiosInstance.post("/api/users/", data)
            .then((response) => {
                toast.success("Account created successfully. Please check your email to continue");
                setUserId(response.data.id);
                router.push("/verify-email");
            })
            .catch((error) => {
                toast.error("Error creating account. Please try again");
                console.log(error.response.data)
                setErrors(error.response.data.password ? error.response.data.password : []);
            })
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setFormInfo({
            ...formInfo,
            [e.target.name]: e.target.value
        });
    }

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" name="firstName" placeholder="First Name" onChange={handleChange} />
            <input type="text" name="lastName" placeholder="Last Name" onChange={handleChange} />
            <input type="email" name="email" placeholder="Email" onChange={handleChange} />
            <input type="password" name="password" placeholder="Password" onChange={handleChange} />
            <input type="password" name="passwordConfirmation" placeholder="Confirm Password" onChange={handleChange} />
            <button type="submit">Register</button>
            {errors.map((error, index) => <p key={index}>{error}</p>)}
        </form>
    )
}