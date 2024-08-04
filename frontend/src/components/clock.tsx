'use client';

import React from 'react';
import { Schedule, TimeBlock } from '@/types';
import { createTimeBlock, deleteTimeBlock, updateTimeBlock } from '@/utils/time-block';

interface ClockProps {
    schedule: Schedule;
}

const Clock: React.FC<ClockProps> = (props: ClockProps) => {
    const [selectedTimeBlock, setSelectedTimeBlock] = React.useState<TimeBlock | null>(null);

    /** Displays information about time block with button to edit/delete */
    const handleOnClick = (timeBlock: TimeBlock) => {
        setSelectedTimeBlock(timeBlock);
    }

    /**
     * Displays a modal with a form to add time block
     * Eventually, this will be a trigger that will enable the user to click and drag to create a time block
     * */
    const handleAdd = () => {
        // test add
        const timeBlock: TimeBlock = {
            id: 0,
            start_time: '00:00',
            end_time: '00:00',
            category: 'Work'
        }

        createTimeBlock(timeBlock).then((data) => {
            console.log(data);
        });
    }

    /**
     * Displays a modal with a form to update time block
     * Eventually, this will be a trigger that will enable the user to click and drag to update the time block
     * */
    const handleUpdate = () => {
        // test update
        const timeBlock: TimeBlock = {
            id: 0,
            start_time: '00:00',
            end_time: '00:00',
            category: 'UPDATED'
        }

        updateTimeBlock(timeBlock).then((data) => {
            console.log(data);
        });
    }

    const handleDelete = (timeBlock: TimeBlock) => {
        deleteTimeBlock(timeBlock).then((deleteTimeBlock) => {
            console.log(deleteTimeBlock);
        })
    }

    return (
        <section>
            <h1>Clock</h1>
            <p>Here's where you'll see the clock view of the schedule.</p>
            <p>Click on a time block to see more details.</p>
            <p>Click "Add Timeblock" to add a new time block.</p>
            <section>
                {selectedTimeBlock && (
                    <div>
                        <p>Start time: {selectedTimeBlock.start_time}</p>
                        <p>End time: {selectedTimeBlock.end_time}</p>
                        <p>Category: {selectedTimeBlock.category}</p>
                        <button onClick={() => handleDelete(selectedTimeBlock)}>Delete Timeblock</button>
                    </div>
                )}
            </section>
            <ul>
                {props.schedule.time_blocks.map((timeBlock: TimeBlock) => (
                    <li key={timeBlock.id} onClick={() => handleOnClick(timeBlock)}>
                        <p>Start time: {timeBlock.start_time}</p>
                        <p>End time: {timeBlock.end_time}</p>
                        <p>Category: {timeBlock.category}</p>
                    </li>
                ))}
                <li onClick={handleAdd}>Add Timeblock</li>
            </ul>
        </section>
    )
}

export default Clock;