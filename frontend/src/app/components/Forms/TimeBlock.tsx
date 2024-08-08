import { SubmitButton } from "../Buttons/SubmitButton";
import { getCategories } from "@/app/actions/TimeBlock";
import styles from './TimeBlock.module.css';
import { ChangeEvent, forwardRef, RefObject } from "react";

interface TimeBlockProps {
    showSubmit: boolean;
    submit_button_text: string;
    formAction: () => void;
    startTime: string;
    endTime: string;
    color: string;
    category: string;
    state: any;
    changeStartTimeHandler?: (e: ChangeEvent<HTMLInputElement>) => void;
    changeEndTimeHandler?: (e: ChangeEvent<HTMLInputElement>) => void;
    changeColorHandler?: (e: ChangeEvent<HTMLInputElement>) => void;
    changeCategoryHandler?: (e: ChangeEvent<HTMLInputElement>) => void;
};

/** Editable timeblock form for creation and updates */
const TimeBlockForm = (
    { showSubmit, submit_button_text, formAction, state,
        startTime, endTime, color, category,
        changeStartTimeHandler, changeEndTimeHandler, changeColorHandler, changeCategoryHandler }
    : TimeBlockProps) => {
    // const categories = getCategories(userId);
    const categories = ['Work', 'Personal', 'School', 'Other'];

    return (
        <form action={formAction} className={styles.form}>
            <div className={styles.time_fields}>
                <div className={styles.time_field}>
                    <label htmlFor="start_time">Start Time</label>
                    <input type="time" id="start_time" value={startTime} onChange={changeStartTimeHandler} required />
                </div>
                <div className={styles.time_field}>
                    <label htmlFor="end_time">End Time</label>
                    <input type="time" id="end_time" value={endTime} onChange={changeEndTimeHandler} required />
                </div>
            </div>
            <div className={styles.text_field}>
                <label htmlFor="category">Category</label>
                <input list="categories" id="category" name="category" placeholder="Work" value={category} onChange={changeCategoryHandler} required />
                <datalist id="categories">
                    {categories.map((category, index) => (
                        <option key={index} value={category} />
                    ))}
                </datalist>
            </div>
            <div className={styles.color_field}>
                <label htmlFor="color">Color</label>
                <input type="color" id="color" placeholder="Color" value={color} onChange={changeColorHandler} required />
            </div>
            <p aria-live="polite" className="sr-only">
                {state?.message}
            </p>
            {showSubmit && <SubmitButton styles={styles.submit_button} text={submit_button_text}/>}
        </form>
    )
}

export default TimeBlockForm;