'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
    const pathname = usePathname()

    return (
        <section>
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