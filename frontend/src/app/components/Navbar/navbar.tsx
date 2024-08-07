'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import styles from './navbar.module.css'

export default function Navbar() {
    const pathname = usePathname()

    return (
        <section className={styles.navbar}>
            <nav>
                <ul>
                    <li>
                        <Link className={`link ${pathname === '/' ? 'active' : ''}`} href="/dashboard">Dashboard</Link>
                    </li>
                    <li>
                        <Link className={`link ${pathname === '/' ? 'active' : ''}`} href="/dashboard/schedule">Schedule</Link>
                    </li>
                    <li>
                        <Link className={`link ${pathname === '/' ? 'active' : ''}`} href="/dashboard/goals">Goals</Link>
                    </li>
                    <li>
                        <Link className={`link ${pathname === '/' ? 'active' : ''}`} href="/dashboard/reflect">Reflect</Link>
                    </li>
                    <li>
                        <Link href="/logout">Logout</Link>
                    </li>
                </ul>
            </nav>
        </section>
    )
}