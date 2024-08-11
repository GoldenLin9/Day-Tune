'use client';

import { Metadata } from 'next'
import { useState } from 'react'
import Clock from '@/app/components/Clock/Clock'
import { Schedule } from '@/types'
import { getSchedule } from '@/app/actions/Schedule'

import styles from './page.module.css'
import Calendar from '@/app/components/Calendar/Calendar'


enum ScheduleView {
    CLOCK = 'clock',
    CALENDAR = 'calendar'
}

/** @TODO Fetch schedule data from server */
export default function SchedulePage() {
    const schedule = {
        time_blocks: [
            // {
            //     id: 1,
            //     start_time: '11:00',
            //     end_time: '16:00',
            //     category: 'Exercise',
            //     color: '#ffdd00',
            //     children: [
            //         {
            //             id: 2,
            //             start_time: '11:30',
            //             end_time: '14:30',
            //             category: 'Walk Cat',
            //             color: '#fab0ef',
            //             children: [],
            //         },
            //     ],
            // },
            // {
            //     id: 2,
            //     start_time: '07:00',
            //     end_time: '09:00',
            //     category: 'High School Meet Up',
            //     color: '#ff0000',
            //     children: [],
            // },
            {
                id: 3,
                start_time: '02:00',
                end_time: '20:00',
                category: 'Breakfast',
                color: '#ffdd00',
                children: [],
            },
            // {
            //     id: 4,
            //     start_time: '20:00',
            //     end_time: '22:00',
            //     category: 'Work',
            //     color: '#0000ff',
            //     children: [],
            // },
            // {
            //     id: 5,
            //     start_time: '23:00',
            //     end_time: '01:00',
            //     category: 'Work',
            //     color: '#fa8072',
            //     children: []

            // },
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

    const [view, setView] = useState(ScheduleView.CLOCK)

    const toggleView = () => {
        setView(view === ScheduleView.CLOCK ? ScheduleView.CALENDAR : ScheduleView.CLOCK)
    }

    return (
        <section className={styles.schedule}>
            <button onClick={toggleView} className={styles.toggle_button}>Toggle View</button>
            { view === ScheduleView.CALENDAR ? <Calendar schedule={schedule}/> : <Clock schedule={schedule}/> }

        </section>
    )
}