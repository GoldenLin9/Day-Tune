
import styles from './layout.module.css'
import Image from 'next/image'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (

    <div id={styles.authDiv}>

        <Image src={"/logo.svg"} alt="logo" width={50} height={50} />
        <h1 id = {styles.appName}>Better Self</h1>
        {children}
    </div>

  );
}