'use client'

import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useFormState } from 'react-dom'

import { createTimeBlock, getCategories } from "@/app/actions/TimeBlock";

import React, { ChangeEvent, useEffect, useState } from "react";
import TimeBlockForm from '@/app/components/Forms/TimeBlock';

const initialState = {
    start_time: '',
    end_time: '',
    category: '',
    color: '',
    message: ''
}

interface CreateTimeBlockFormProps {
    startTime: string;
    endTime: string;
    color: string;
    category: string;
    showSubmit: boolean;
    onChangeStartTimeHandler?: (e: ChangeEvent<HTMLInputElement>) => void;
    onChangeEndTimeHandler?: (e: ChangeEvent<HTMLInputElement>) => void;
    onChangeColorHandler?: (e: ChangeEvent<HTMLInputElement>) => void;
    onChangeCategoryHandler?: (e: ChangeEvent<HTMLInputElement>) => void;
}

const CreateTimeBlockForm: React.FC<CreateTimeBlockFormProps> = (props: CreateTimeBlockFormProps) => {
    const router = useRouter();

    // Server side form states
    const [state, formAction] = useFormState(createTimeBlock, initialState);

    useEffect(() => {
        if (state?.message === 'Time block created successfully') {
            router.back();
        }
    })

    return (
        <TimeBlockForm
            submit_button_text="Create Time Block"
            formAction={formAction}
            startTime={props.startTime}
            endTime={props.endTime}
            color={props.color}
            category={props.category}
            changeStartTimeHandler={props.onChangeStartTimeHandler}
            changeEndTimeHandler={props.onChangeEndTimeHandler}
            changeColorHandler={props.onChangeColorHandler}
            changeCategoryHandler={props.onChangeCategoryHandler}
            showSubmit={props.showSubmit}
            state={state}
        />
    )
}

export default CreateTimeBlockForm;