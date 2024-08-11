import { SubmitButton } from "../Buttons/SubmitButton";
import { getCategories } from "@/app/actions/TimeBlock";
import styles from './TimeBlock.module.css';
import { ChangeEvent, forwardRef, RefObject } from "react";

interface TimeBlockProps {
    color: string;
    category: string;
    state: any;
    changeColorHandler?: (e: ChangeEvent<HTMLInputElement>) => void;
    changeCategoryHandler?: (e: ChangeEvent<HTMLInputElement>) => void;
    startTime: string;
    endTime: string;
    onSubmit: (e: any) => void;
};

/** Partially editable timeblock form for clock page */
const CreateTimeBlockPartialForm = (
    { state, startTime, endTime, color, category, changeColorHandler, changeCategoryHandler, onSubmit }
    : TimeBlockProps) => {
    // const categories = getCategories(userId);
    const categories = ['Work', 'Personal', 'School', 'Other'];

    return (
        <form action={onSubmit} className={styles.form}>
            <dl>
                <div className={styles.time_fields}>
                    <div className={styles.time_field}>
                        <dt>Start Time</dt>
                        <dd>{startTime}</dd>
                    </div>
                    <div className={styles.time_field}>
                        <dt>End Time</dt>
                        <dd>{endTime}</dd>
                    </div>
                </div>
            </dl>
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
            <SubmitButton styles={styles.submit_button} text="Create"/>
        </form>
    )
}

export default CreateTimeBlockPartialForm;