import Navbar from "@/app/components/Navbar/navbar"

import styles from './layout.module.css'

export default function DashboardLayout({
    children, // will be a page or nested layout
}: {
    children: React.ReactNode
}) {
    return (
        <section className={styles.dashboard}>
            <Navbar />

            {children}
        </section>
    )
}