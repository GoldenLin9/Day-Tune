"use client"

import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "./layout";
import { useEffect, useState } from "react";
import useAxios from "@/hooks/useAxios";

export default function Dashboard() {

    const { loading } = useAuth();

    const [user, setUser] = useState(null);

    const axiosInstance = useAxios();
    useEffect(() => {

        axiosInstance.get("api/users/me")
        .then(res => {  
            setUser(res.data);
        })
        .catch(err => {
            console.error(err);
        })

    }, [])

    // set data when user is loaded

    return <h1>WELCOME, {user?.first_name} {user?.last_name}</h1>
}