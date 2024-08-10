"use client"

import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "./layout";

export default function Dashboard() {

    const { user, loading } = useAuth();

    // set data when user is loaded

    return <h1>WELCOME, {user?.first_name} {user?.last_name}</h1>
}