"use client"

import VerifyForm from "@/app/components/Forms/VerifyForm"
import styles from '../authForms.module.css'
import Link from 'next/link'

export default function VerifyPage() {

    const handlResend = () => {
        console.log("Resend code")
    }

    return (
        <>
            <h1 className={styles.authTypeHeader} >Verify</h1>
            <VerifyForm />
            <p className = {styles.authAltText}><span onClick = {handlResend} className = {styles.highlightText}>Send code again.</span> 20 seconds</p>
        </>
    )
}