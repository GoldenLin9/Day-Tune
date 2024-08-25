"use client"

import React, { createContext, useState, ReactNode, useContext, SetStateAction, Dispatch, useEffect } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import useAxios from "@/hooks/useAxios";
import { useRouter } from "next/navigation";
import { Errors } from "@/types";

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

    oauthLogin: (code: string, state: string) => Promise<Errors>;
    login: (email: string, password: string) => Promise<Errors>;
    register: (firstName: string, lastName: string, email: string, password: string, rePassword: string) => Promise<Errors>;
    verifyEmail: (code: string) => Promise<Errors>;
    forgotPassword: (email: string) => Promise<Errors>;
    resetPassword: (password: string, rePassword: string, uid: string, token: string) => Promise<Errors>;
    logout: () => void;
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
    setLoading: () => {},

    oauthLogin: async (code: string, state: string) => [],
    login: async (email: string, password: string) => [], 
    register: async (firstName: string, lastName: string, email: string, password: string, rePassword: string) => [],
    logout: () => {},
    forgotPassword: async (email: string) => [],
    resetPassword: async (password: string, rePassword: string, uid: string, token: string) => [],
    verifyEmail: async (code: string) => []
};

// Create the context with the default values
export const AuthContext = createContext<AuthContextType>(defaultContextValue);

interface AuthProviderProps {
    children: ReactNode;
}

// turns error data in the form of an object into an array of objects
function errorObjectToArray(error: any): Errors {
    return Object.entries(error).map(
        ([field, messages]) => ({
            field,
            messages: messages as string[],
        })
    );
}


export default function AuthProvider({ children }: AuthProviderProps) {
    const [accessToken, setAccessToken] = useState<string | null>(Cookies.get("access") || null);
    const [refreshToken, setRefreshToken] = useState<string | null>(Cookies.get("refresh") || null);

    const [user, setUser] = useState<any>(null);


    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const axiosInstance = useAxios();
    const router = useRouter();

    const baseURL = process.env.NEXT_PUBLIC_HOST;

    async function oauthLogin(code: string, state: string): Promise<Errors> {
        let loginErrors: Errors = [];

        try {
            Cookies.set("state", state)

            let url = `${baseURL}/api/o/google-oauth2/?state=${encodeURIComponent(state)}&code=${encodeURIComponent(code)}`

            const response = await axios.post(url, {}, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            if (response.status === 201) {
                const { access, refresh } = response.data;

                setAccessToken(access);
                setRefreshToken(refresh);
                Cookies.set("access", access);
                Cookies.set("refresh", refresh);

                const userResponse = await axios.get(`${baseURL}/api/users/me`, {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                });
                setUser(userResponse.data);
            }

        } catch (error: any) {
            loginErrors = error.response.data || [{"error": "An error occurred"}];
        } finally {
            setLoading(false);
        }

        return loginErrors;
    }

    async function login(email: string, password: string): Promise<Errors> {
        let loginErrors: Errors = [];

        try {
            const response = await axios.post(`${baseURL}/api/jwt/create/`, { email: email, password: password });
            if (response.status === 200) {
                const { access, refresh } = response.data;
                setAccessToken(access);
                setRefreshToken(refresh);
                Cookies.set("access", access);
                Cookies.set("refresh", refresh);


                const userResponse = await axios.get(`${baseURL}/api/users/me`, {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                });
                setUser(userResponse.data);
            }
        } catch (error: any) {

            loginErrors = errorObjectToArray(error.response.data);
        } finally {
            setLoading(false);
        }

        return loginErrors;
    }


    async function register(firstName: string, lastName: string, email: string, password: string, rePassword: string): Promise<Errors> {
        let registerErrors: Errors = [];

        try {
            const response = await axios.post(`${baseURL}/api/users/`, { first_name: firstName, last_name: lastName, email, password, re_password: rePassword });
            if (response.status === 201) {
                setUserId(response.data.id);
            }
        } catch (error: any) {

            registerErrors = errorObjectToArray(error.response.data);

        }

        return registerErrors;
    }

    async function verifyEmail(code: string): Promise<Errors> {
        let verifyErrors: Errors = [];

        try {
            await axios.post(`${baseURL}/api/verify-email/`, { userId, code });
        } catch (error: any) {
            verifyErrors = errorObjectToArray(error.response.data);
        }

        return verifyErrors;
    }

    async function forgotPassword(email: string): Promise<Errors> {
        let forgotError: Errors = [];

        try {
            await axios.post(`${baseURL}/api/users/reset_password/`, { email });
        } catch (error: any) {
            forgotError = errorObjectToArray(error.response.data);
        }

        return forgotError;
    }

    async function resetPassword(uid: string, token: string, password: string, rePassword: string): Promise<Errors> {
        let resetErrors: Errors = [];
        try {
            await axios.post(`${baseURL}/api/users/reset_password_confirm/`, {
                uid: uid,
                token: token,
                new_password: password,
                re_new_password: rePassword,
            });
        } catch (error: any) {
            resetErrors = errorObjectToArray(error.response.data);
        }

        return resetErrors;
    }


    function logout() {
        Cookies.remove("access");
        Cookies.remove("refresh");
        setAccessToken(null);
        setRefreshToken(null);
        setUser(null);
        router.push("/");
    }


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
        setLoading,

        oauthLogin,
        login,
        register,
        logout,
        verifyEmail,
        forgotPassword,
        resetPassword,
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
