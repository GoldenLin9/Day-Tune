'use client'

import { Suspense, useState } from 'react'
import Loading from './loading'

import styles from '@/app/components/Modals/Modal.module.css'
import TimeBlockPage from './[id]/page'
import TimeBlockEditPage from './[id]/edit/page'
import { TimeBlock } from '@/types'
import { useRouter } from 'next/navigation'

/**
 * Since creating a modal for dashboard/schedule/timeblock/[id]/edit
 * doesn't work while the modal for dashboard/schedule/timeblock/[id] does,
 * this layout is used to switch between the two pages
 * @TODO Fetch timeBlock data from the server using the id
 */
export default function TimeBlockLayout({
    params: { id },
} : {
    params: { id: string },
}) {
    const [editMode, setEditMode] = useState(false);
    const router = useRouter();

    const timeBlock: TimeBlock = {
        start_time: '10:00',
        end_time: '11:00',
        category: 'Work',
        color: '#FF0000',
    }

    const handleBack = () => {
        if (editMode) {
            setEditMode(false);
        }
        else {
            router.back();
        }
    }

    return (
        <Suspense fallback={<Loading />}>
            {editMode ? <TimeBlockEditPage params={{ timeBlock }} />
                : <TimeBlockPage params={{ timeBlock }} />
            }

            { !editMode ?
                <button className={styles.edit_button} onClick={() => setEditMode(!editMode)}>Edit</button>
                : null
            }

            <button className={styles.back_button} onClick={handleBack}>Back</button>

        </Suspense>
    )
}