"use client"

import { useAuth } from "@/context/AuthContext";
import useAxios from "@/hooks/useAxios";
import { useState } from "react";

export default function Dashboard() {

    const { user, loading } = useAuth();

    const [data, setData] = useState<any>(null);

    const axiosInstance = useAxios();

    // set data when user is loaded

    console.log("MY USER: ", user);

    function handleClick() {    
        axiosInstance.get("/api/users/me").then((response) => { 
            console.log("USER DATA!!!: ", response.data);
        }).catch((error) => {
            console.error(error);
        })
    }


    // return <h1><button onClick = {handleClick}>GET MY DATA</button></h1>
    return <h1>Hello {user?.email}</h1>
}