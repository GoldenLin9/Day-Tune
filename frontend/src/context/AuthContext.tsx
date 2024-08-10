"use client"

import React, { createContext, useState, ReactNode, useContext, SetStateAction, Dispatch, useEffect } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import useAxios from "@/hooks/useAxios";

interface User {
    first_name: string;
    last_name: string;
    email: string;
    id: string;
}

type StateSetter<T> = Dispatch<SetStateAction<T>>;

interface AuthContextType {
    user: User | null;
    setUser: StateSetter<User | null>;
    userId: string | null;
    setUserId: StateSetter<string | null>;
    accessToken: string | null;
    setAccessToken: StateSetter<string | null>;
    refreshToken: string | null;
    setRefreshToken: StateSetter<string | null>;
    loading: boolean;
    setLoading: StateSetter<boolean>;
}

// Default values for the context
const defaultContextValue: AuthContextType = {
    user: null,
    setUser: () => {},
    userId: null,
    setUserId: () => {},
    accessToken: null,
    setAccessToken: () => {},
    refreshToken: null,
    setRefreshToken: () => {},
    loading: true,
    setLoading: () => {}
};

// Create the context with the default values
export const AuthContext = createContext<AuthContextType>(defaultContextValue);

interface AuthProviderProps {
    children: ReactNode;
}


export default function AuthProvider({ children }: AuthProviderProps) {
    const [accessToken, setAccessToken] = useState<string | null>(() => {
        const token = Cookies.get("access");
        return token !== undefined ? token : null;
    });

    const [refreshToken, setRefreshToken] = useState<string | null>(() => {
        const token = Cookies.get("refresh");
        return token !== undefined ? token : null;
    })

    const [user, setUser] = useState<any>(null);


    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const axiosInstance = useAxios();

    
    useEffect(() => {
        axiosInstance.get("/api/users/me")
        .then((response) => {
            setUser(response.data);
        })
        .catch((error) => {
            console.error(error);
        })

        setLoading(false);
    }, []);
        

    let value = {
        user,
        setUser,
        userId,
        setUserId,
        accessToken,
        setAccessToken,
        refreshToken,
        setRefreshToken,
        loading,
        setLoading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {

    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
