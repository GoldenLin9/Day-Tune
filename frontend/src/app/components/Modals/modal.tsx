'use client'
import { useRouter } from 'next/navigation'
import { ElementRef, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import styles from './modal.module.css';

const Modal = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const dialogRef = useRef<ElementRef<'dialog'>>(null);

    useEffect(() => {
        if (!dialogRef.current?.open) {
            dialogRef.current?.showModal();
        }
    }, []);

    function onDismiss() {
        router.back();
    }

    return createPortal(
        <div className="modal-backdrop">
            <dialog ref={dialogRef} className={`${styles.modal} modal`} onClose={onDismiss}>
            {children}
            <button onClick={onDismiss} className={`${styles.close_button} close-button`}>Back</button>
            </dialog>
        </div>,
        document.getElementById('modal-root')!
    );
}

export default Modal;