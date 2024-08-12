'use client';

import { Schedule } from "@/types";

interface CalendarProps {
    schedule: Schedule;
}

export default function Calendar(props: CalendarProps) {
    return (
        <section>
            <h1>Calendar</h1>
            <p>Here's where you'll see the calendar view of schedule.</p>
        </section>
    )
}