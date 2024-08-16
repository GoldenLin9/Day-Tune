import Image from 'next/image'

import Link from 'next/link'
import styles from './page.module.css'

import AuthButton from '@/app/components/Buttons/AuthButton'

export default function Home() {
    return (
        <>
            <header id = {styles.header}>
                <div id = {styles.logo}>
                    <Image src = {"/logo.svg"} alt = "logo" width = {50} height = {50}/>
                    <h1>Better Self</h1>
                </div>
            
                <nav id = {styles.nav}>
                    <ul>
                        {/* takes you down to these subsections of the lander page */}
                        <li><Link className = {styles.headerLink} href = "#">Features</Link></li>
                        <li><Link className = {styles.headerLink} href = "#">About</Link></li>
                        <li><Link className = {styles.headerLink} href = "#">Reviews</Link></li>
                    </ul>

                    <span id = {styles.divider}>|</span>

                    <ul>
                        {/* takes you to other pages */}
                        <li><Link className = {styles.headerLink} href = "/login">Login</Link></li>
                        <li><Link className = {styles.headerLink} href = "/register">Register</Link></li>
                        <li><AuthButton text={"Get Started"} link={"/dashboard"} /></li>
                    </ul>
                </nav>

            </header>


            <main id = {styles.main}>

                <div id = {styles.hero}>
                    <blockquote>
                        <p>“Plan,</p>
                        <p>Reflect,</p>
                        <p>Achieve”</p>
                    </blockquote>

                    <p id = {styles.heroText} >Get started on your journey to self improvement today</p>

                    <AuthButton text={"Get Started"} link={"/dashboard"} />
                </div>

                <div className={styles.features}>
                    <h2>Features</h2>
                    <div className={styles.featureItem}>
                        <h3>Feature 1</h3>
                        <p>Description of feature 1.</p>
                    </div>
                    <div className={styles.featureItem}>
                        <h3>Feature 2</h3>
                        <p>Description of feature 2.</p>
                    </div>
                    <div className={styles.featureItem}>
                        <h3>Feature 3</h3>
                        <p>Description of feature 3.</p>
                    </div>
                </div>

                <div className={styles.testimonials}>
                    <h2>Success Stories</h2>
                    <div className={styles.testimonialItem}>
                        <p>“This app changed my life!”</p>
                        <p>- User 1</p>
                    </div>
                    <div className={styles.testimonialItem}>
                        <p>“I love how easy it is to use.”</p>
                        <p>- User 2</p>
                    </div>
                    <div className={styles.testimonialItem}>
                        <p>“Highly recommend to everyone.”</p>
                        <p>- User 3</p>
                    </div>
                </div>
            </main>
        </>
    );
}
