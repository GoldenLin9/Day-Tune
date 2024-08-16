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
    
    

    axiosInstance.interceptors.request.use(async req => {

        
        if (!accessToken) {
            console.log("No access token")
            return req;
        }

        const tokenExpiration = jwtDecode(accessToken).exp as number;
        const isExpired = dayjs().isAfter(dayjs.unix(tokenExpiration));
    
    
        if (!isExpired) {
            return req;
        }
    
        try {
            const response = await axios.post(`${baseURL}/api/jwt/refresh/`, { refresh: refreshToken });
    
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