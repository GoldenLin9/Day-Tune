'use client'

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Cookies from 'js-cookie'


export default function Page() {
    const router = useRouter()
    const searchParams = useSearchParams()


    useEffect(() => {

        const code = searchParams.get('code')
        const state = searchParams.get('state')

        if (state && code) {

            const csrfToken = Cookies.get('csrftoken') || ''
            
            // authenticate the user
            Cookies.set('state', state)
            let url = `${process.env.NEXT_PUBLIC_HOST}/api/o/google-oauth2/?state=${encodeURIComponent(state)}&code=${encodeURIComponent(code)}`;
            

            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                }
            }).then(response => {
                if (response.ok) {
                    return response.json()
                } else {
                    throw new Error("Failed to authenticate user")
                }
            }).then(data => {
                router.push('/dashboard')
            }).catch(error => {
                console.error(error)
            })

        } else {

        }


    }, [])

    return (
        <div>
            <h1>Loading ...</h1>
        </div>
    )
}