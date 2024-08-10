'use client'

import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

import React from "react";
import CreateTimeBlockForm from '@/app/components/Forms/CreateTimeBlock';

interface CreateTimeBlockProps {
    startTime: string;
    endTime: string;
}

/**
 * Displays a form to create a new TimeBlock
 * when you navigate to /dashboard/schedule/timeblock/create directly
*/
const CreateTimeBlockPage: React.FC<CreateTimeBlockProps> = (props: CreateTimeBlockProps) => {
    const router = useRouter();

    // Get start_time and end_time from URL query params
    const query = useSearchParams();
    const startTime = query.get('start_time') || '';
    const endTime = query.get('end_time') || '';
    const color = query.get('color') || '#000000';
    const category = query.get('category') || '';

    return (
        <CreateTimeBlockForm startTime={startTime} endTime={endTime} color={color} category={category} showSubmit={true}/>
    )
}

export default CreateTimeBlockPage;