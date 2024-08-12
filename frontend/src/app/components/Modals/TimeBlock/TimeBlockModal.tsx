'use client'

import styles from './timeblock.module.css';
import { TimeBlock } from "@/types";

interface TimeBlockProps {
    timeBlock: TimeBlock;
}
const formatTime = (time: string) => {
    let splitTime = time.split(":");

    if (splitTime.length > 1) {
        let [hours, mins] = splitTime;
        let string_hours = hours;
        let string_minutes = mins;

        if (mins.length < 2) {
            string_minutes = `0${string_minutes}`;
        }
        if (hours.length < 2) {
            string_hours = `0${string_hours}`;
        }

        return `${string_hours}:${string_minutes}`;
    } else if (parseInt(time) < 10){
        return `0${time}:00`;
    } else {
        return `${time}:00`;
    }

}

/** Displays info for a specific TimeBlock */
const TimeBlockModal: React.FC<TimeBlockProps> = (props: TimeBlockProps) => {
    const formatted_start_time = formatTime(props.timeBlock.start_time);
    const formatted_end_time = formatTime(props.timeBlock.end_time);

    return (
        <div className={styles.timeblock}>
            <dl>
                <div className={styles.text_field}>
                    <dt>Category</dt>
                    <dd className={styles.category}>{props.timeBlock.category}</dd>
                </div>
                <div className={styles.time_fields}>
                    <div className={styles.time_field}>
                        <dt>Start Time</dt>
                        <dd><input type="time" readOnly value={formatted_start_time} className={styles.input}/></dd>
                    </div>
                    <div className={styles.time_field}>
                        <dt>End Time</dt>
                        <dd><input type="time" readOnly value={formatted_end_time} className={styles.input}/></dd>
                    </div>
                </div>
                <div className={styles.color_field}>
                    <dt>Color</dt>
                    <dd style={{backgroundColor: props.timeBlock.color}}>
                        <div className={styles.color}></div>
                    </dd>
                </div>
            </dl>
        </div>
    )
}

export default TimeBlockModal;