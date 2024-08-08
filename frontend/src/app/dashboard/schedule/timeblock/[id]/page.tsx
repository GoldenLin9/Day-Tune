'use client'

import styles from './page.module.css';
import { TimeBlock } from "@/types";

/** Displays info for a specific TimeBlock
 * when you navigate to /dashboard/schedule/timeblock/[id] directly */
const TimeBlockPage = ({
    params: { timeBlock }
} : {
    params: { timeBlock: TimeBlock }
}) => {

    return (
        <div className={styles.timeblock}>
            <dl>
                <div className={styles.time_fields}>
                    <div className={styles.time_field}>
                        <dt>Start Time</dt>
                        <dd>{timeBlock.start_time}</dd>
                    </div>
                    <div className={styles.time_field}>
                        <dt>End Time</dt>
                        <dd>{timeBlock.end_time}</dd>
                    </div>
                </div>
                <div className={styles.text_field}>
                    <dt>Category</dt>
                    <dd className={styles.category}>{timeBlock.category}</dd>
                </div>
                <div className={styles.color_field}>
                    <dt>Color</dt>
                    <dd style={{backgroundColor: timeBlock.color}}>
                        <div className={styles.color}></div>
                    </dd>
                </div>
            </dl>
        </div>
    )
}

export default TimeBlockPage;