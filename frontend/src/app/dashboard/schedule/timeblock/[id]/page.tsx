'use client'

import { getTimeBlock, updateTimeBlock } from "@/app/actions/time-block";
import { TimeBlock } from "@/types";
import { useState } from "react";
import { useRouter } from 'next/navigation';

const TimeBlockPage = ({
    params: { id }
} : {
    params: { id: string }
}) => {
    const router = useRouter();
    const [editMode, setEditMode] = useState(false);

    // const timeBlock = await getTimeBlock(parseInt(id))
    const timeBlock = {
        start_time: '12:00',
        end_time: '13:00',
        category: 'Work',
        color: 'blue',
        id: 1
    }

    const handleEdit = (formData: FormData) => {
        // updateTimeBlock({
        //     start_time: formData.get('start_time') as string,
        //     end_time: formData.get('end_time') as string,
        //     category: formData.get('category') as string,
        //     color: formData.get('color') as string,
        //     id: timeBlock.id as number
        // });
        console.log("Edited!")

        router.back();
    }

    const editForm = () => {
        return (
            <form action={handleEdit}>
                <input type="text" value={timeBlock.start_time} />
                <input type="text" value={timeBlock.end_time} />
                <input type="text" value={timeBlock.category} />
                <input type="text" value={timeBlock.color} />
                <button>Save</button>
            </form>
        )
    }

    const displayBlock = () => {
        return (
            <div className="time-block">
                <p>{timeBlock.start_time}</p>
                <p>{timeBlock.end_time}</p>
                <p>{timeBlock.category}</p>
                <p>{timeBlock.color}</p>
                <button onClick={() => setEditMode(true)}>Edit</button>
            </div>
        )
    }

    return (
        <div>
            {editMode ? editForm() : displayBlock()}
        </div>
    )
}

export default TimeBlockPage;