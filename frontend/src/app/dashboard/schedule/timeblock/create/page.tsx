'use client'

import { TimeBlock } from "@/types";
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

import { createTimeBlock, getCategories } from "@/app/actions/time-block";
import { revalidatePath } from "next/cache";

import styles from './page.module.css';

const CreateTimeBlockPage: React.FC = () => {
    const router = useRouter();
    const query = useSearchParams();
    const start_time = query.get('start_time') || '';
    const end_time = query.get('end_time') || '';

    // const categories = getCategories(userId);
    const categories = ['Work', 'Personal', 'School', 'Other'];

    const roundTime = (value: string, min: number, max: number) => {
        let numValue = parseFloat(value);
        // Round to nearest half hour
        numValue = Math.round(numValue * 2.0) / 2.0;

        if (numValue < min) {
            return min;
        } else if (numValue > max) {
            return max;
        } else {
            return numValue;
        }
    }

    const convertFloatToTimestamp = (time: number) => {
        const hours = Math.floor(time);
        const minutes = Math.round((time - hours) * 60);
        let string_hours = hours.toString();
        let string_minutes = minutes.toString();
        if (minutes < 10) {
            string_minutes = `0${string_minutes}`;
        }
        if (hours < 10) {
            string_hours = `0${string_hours}`;
        }
        return `${string_hours}:${string_minutes}`;
    }

    const clamped_start_time = convertFloatToTimestamp(roundTime(start_time, 0, 23));
    const clamped_end_time = convertFloatToTimestamp(roundTime(end_time, 0, 23));

    const handleCreateTimeBlock = async (formData: FormData) => {
        const timeBlock: TimeBlock = {
            start_time: formData.get('start_time') as string,
            end_time: formData.get('end_time') as string,
            category: formData.get('category') as string,
            color: formData.get('color') as string,
            id: -1
        }

        createTimeBlock(timeBlock)

        router.back()
    }

    return (
        <div>
            <form action={handleCreateTimeBlock}  className={styles.form}>
                <div className={styles.time_fields}>
                    <div className={styles.time_field}>
                        <label htmlFor="start_time">Start Time</label>
                        <input type="time" id="start_time" defaultValue={clamped_start_time} />
                    </div>
                    <div className={styles.time_field}>
                        <label htmlFor="end_time">End Time</label>
                        <input type="time" id="end_time" defaultValue={clamped_end_time} />
                    </div>
                </div>
                <div className={styles.text_field}>
                    <label htmlFor="category">Category</label>
                    <input list="categories" id="category" name="category" placeholder="Work" />
                    <datalist id="categories">
                        {categories.map((category, index) => (
                            <option key={index} value={category} />
                        ))}
                    </datalist>
                </div>
                <div className={styles.color_field}>
                    <label htmlFor="color">Color</label>
                    <input type="color" id="color" placeholder="Color" />
                </div>
                <button type="submit" className={styles.submit_button}>Create Time Block</button>
            </form>
        </div>
    )
}

export default CreateTimeBlockPage;