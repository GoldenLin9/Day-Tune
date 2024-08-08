import { Metadata } from 'next'
import { Suspense } from 'react'
import Clock from '@/app/components/Clock/Clock'
import { Schedule } from '@/types'
import { getSchedule } from '@/app/actions/Schedule'

import styles from './page.module.css'

// Static metadata
export const metadata: Metadata = {
  title: 'Schedule',
}

/** @TODO Fetch schedule data from server */
export default async function SchedulePage() {
    const schedule: Schedule = {
        time_blocks: [
            {
                id: 0,
                start_time: '11',
                end_time: '13',
                category: 'Work',
                color: '#ffff00'
            },
            {
                id: 1,
                start_time: '15',
                end_time: '17',
                category: 'Work',
                color: '#ffff00'
            },
            {
                id: 2,
                start_time: '7',
                end_time: '9',
                category: 'Work',
                color: '#ffff00'
            },
            {
                id: 3,
                start_time: '2',
                end_time: '3',
                category: 'Work',
                color: '#ffff00'
            },
            {
                id: 4,
                start_time: '20',
                end_time: '22',
                category: 'Work',
                color: '#ffff00'
            },
            {
                id: 5,
                start_time: '23',
                end_time: '1',
                category: 'Work',
                color: '#ffff00'
            }
        ],
        id: 0,
        user: {
            id: 0,
            email: '',
            first_name: '',
            last_name: ''
        }
    };
    // const schedule = await getSchedule().then((data) => {
    //     let schedule: Schedule = {
    //         time_blocks: data.time_blocks,
    //         id: data.id,
    //         user: data.user
    //     }

    //     return schedule
    // })

    return (
        <section className={styles.schedule}>
            <Suspense fallback={<p>Loading schedule...</p>}>
                <Clock schedule={schedule}/>
            </Suspense>
        </section>
    )
}