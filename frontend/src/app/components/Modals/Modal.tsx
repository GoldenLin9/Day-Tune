'use client'
import { useRouter } from 'next/navigation'
import { ElementRef, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import styles from './Modal.module.css';

/**
 * Uses the dialog tag to create a modal that overlays the page
 * @param children The content to be displayed in the modal
 * @param showBackButton Whether to show a back button in the modal
 */
const Modal = ({ children, showBackButton }: { children: React.ReactNode, showBackButton: boolean }) => {
    const router = useRouter();
    const dialogRef = useRef<ElementRef<'dialog'>>(null);
    const fakeDialogRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        document.addEventListener('click', handleMouseClick);

        return () => {
            document.removeEventListener('click', handleMouseClick);
        }
    }, [])

    const handleMouseClick = (e: MouseEvent) => {
        if (fakeDialogRef.current == e.target) {
            e.stopPropagation();
            return;
        }
        else if (dialogRef.current == e.target) {
            router.back();
        }
    }

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
            <div ref={fakeDialogRef} className={styles.fakeModal}></div>
            {children}
            {showBackButton && <button onClick={onDismiss} className={`${styles.back_button} close-button`}>Back</button>}
            </dialog>
        </div>,
        document.getElementById('modal-root')!
    );
}

export default Modal;