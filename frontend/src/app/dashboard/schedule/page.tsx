import { Metadata } from 'next'
import { Suspense } from 'react'
import Clock from '@/components/clock'
import { Schedule } from '@/types'
import { getSchedule } from '@/utils/schedule'

// Static metadata
export const metadata: Metadata = {
  title: 'Schedule',
}

export default async function SchedulePage() {
    const schedule: Schedule = {
        time_blocks: [
            {
                id: 0,
                start_time: '12:00',
                end_time: '14:00',
                category: 'Work'
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
        <section>
            <Suspense fallback={<p>Loading schedule...</p>}>
                <Clock schedule={schedule}/>
            </Suspense>
        </section>
    )
}