"use client"

import { toast } from 'react-toastify';
import useAxios from '@/hooks/useAxios';
import styles from './SocialAuth.module.css';
import Image from 'next/image';

interface Props {
    type: "Google";
    provider: 'google-oauth2';
    callbackUrl: string;
}

export function SocialButton({ type, provider }: Props) {

    const axiosInstance = useAxios();

    async function continueWithSocial() {
        // Use the Google OAuth API to sign in
        try {
            const url = `${process.env.NEXT_PUBLIC_HOST}/api/o/${provider}/?redirect_uri=http://localhost:3000/auth/google`;

            const response = await axiosInstance.get(url);

            if (response.status == 200) {
                window.location.replace(response.data.authorization_url)
            } else {
                toast.error("Failed to sign in with Google");
            }

        } catch (error) {
            console.error(error);
        }

    }

    return (
        <button className={styles.gsiMaterialButton} onClick={continueWithSocial}>
            <div className={styles.gsiMaterialButtonState}></div>
            <div className={styles.gsiMaterialButtonContentWrapper}>
                <div className={styles.gsiMaterialButtonIcon}>
                    <Image src="/google-icon.svg" alt="Google Icon" width={24} height={24} />
                </div>
                <span className={styles.gsiMaterialButtonContents}>Sign in with Google</span>
            </div>
        </button>
    )
}