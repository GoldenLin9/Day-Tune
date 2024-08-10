'use client'

import { getTimeBlock, updateTimeBlock } from "@/app/actions/TimeBlock";
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { useFormState } from "react-dom";
import TimeBlockForm from "@/app/components/Forms/TimeBlock";
import { TimeBlock } from "@/types";

const initialState = {
    start_time: '',
    end_time: '',
    category: '',
    color: '',
    message: ''
}

/** Displays a form to edit a specific TimeBlock
 * when you navigate to /dashboard/schedule/timeblock/[id]/edit directly
*/
const TimeBlockEditPage = ({
    params: { timeBlock }
} : {
    params: { timeBlock: TimeBlock }
}) => {
    const router = useRouter();
    const [state, formAction] = useFormState(updateTimeBlock, initialState);

    useEffect(() => {
        if (state?.message === 'Time block updated successfully') {
            router.back();
        }
    })

    return (
        <TimeBlockForm
            submit_button_text="Update Time Block"
            formAction={formAction}
            state={state}
            startTime={timeBlock.start_time}
            endTime={timeBlock.end_time}
            color={timeBlock.color}
            category={timeBlock.category}
            showSubmit={true}
        />
    )
}

export default TimeBlockEditPage;