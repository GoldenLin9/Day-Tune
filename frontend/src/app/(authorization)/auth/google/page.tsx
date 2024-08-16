'use client'

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Cookies from 'js-cookie'
import axios from 'axios'
import React, {useState} from "react"
import { useAuth } from "@/context/AuthContext"


interface URLSearchParams {
    code: string;
    state: string;
}

type Error = string | null;
type Errors = Array<Error>;


export default function Page( { params, searchParams } : { params: any, searchParams: URLSearchParams }) {

    const router = useRouter()

    const [errors, setErrors] = useState<Errors | []>([])

    const { oauthLogin } = useAuth()

    useEffect(() => {
        if (searchParams.code && searchParams.state) {
            oauthLogin(searchParams.code, searchParams.state).then(loginErrors => {
                if (loginErrors.length !== 0) {
                    for (let [key, value] of Object.entries(loginErrors)) {
                        setErrors(errors => [...errors, value])
                    }
                } else {
                    router.push("/dashboard")
                }
            })
        }

    }, [searchParams, oauthLogin, router])

    return (
        <div>
            <h1>Loading ...</h1>
            {errors && <p>{errors}</p>}
        </div>
    )
}