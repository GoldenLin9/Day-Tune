"use client"

import axios from 'axios';

import { useAuth } from '@/context/AuthContext';
import { jwtDecode } from 'jwt-decode';
import dayjs from 'dayjs';
import Cookies from 'js-cookie';

const baseURL = process.env.NEXT_PUBLIC_HOST

const useAxios = () => {

    const { accessToken, setAccessToken, refreshToken, user } = useAuth()

    const axiosInstance = axios.create({
        baseURL,
        headers: {
            'Content-Type': 'application/json'
        },
        withCredentials: true
    });
    
    
    // Optional: Add interceptors if needed
    axiosInstance.interceptors.request.use(async req => {

        console.log("ENTERED")

        console.log("2MY REFRESH TOKEN: ", refreshToken);
        console.log("222MY ACCESS TOKEN: ", accessToken);
        console.log("222 MY USER: ", user);
    
        // get new access token if expired
        
        if (!refreshToken) {
            return req;
        }
    
        const isExpired = jwtDecode(refreshToken).exp < dayjs().unix();

        console.log("IS MY TOKEN EXPIRED: ", isExpired);
    
        if (!isExpired) {
            return req;
        }
    
        try {
            const response = await axiosInstance.post("api/jwt/refresh/");
    
            if (response.status === 200) {
                const { access } = response.data;
                setAccessToken(access);
                Cookies.set("access", access);
                
            }
    
        } catch (error) {
            console.error(error);
        }
    
        return req;
    
    });

    return axiosInstance;
}

export default useAxios;