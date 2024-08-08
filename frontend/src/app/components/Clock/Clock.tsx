'use client';

import React, { useEffect, useRef } from 'react';
import { Schedule, TimeBlock } from '@/types';
import { useRouter } from 'next/navigation'

import styles from './Clock.module.css';
import CreateTimeBlockForm from '../Forms/CreateTimeBlock';
import { createTimeBlock } from '@/app/actions/TimeBlock';

interface ClockProps {
    schedule: Schedule;
}

/**
 * (x, y) coordinates of a point
 * @typedef {Object} Point
 * @property {number} x
 * @property {number} y
 */
type Point = {
    x: number,
    y: number
};

/**
 * Visual representation of a time block
 * @typedef {Object} Wedge
 * @property {number} start_angle: Value in range [0, 2 PI]
 * @property {number} end_angle: Value in range [0, 2 PI]
 * @property {boolean} clockwise: Direction of the wedge (true by Default)
 */
type Wedge = {
    start_angle: number,
    end_angle: number,
    clockwise: boolean,
    color: string
}

const Clock: React.FC<ClockProps> = (props: ClockProps) => {
    const router = useRouter();

    // Display more info about the selected time block
    const [selectedTimeBlock, setSelectedTimeBlock] = React.useState<TimeBlock | null>(null);

    // Store the wedges for each time block
    const wedgesRef = useRef<Wedge[]>([]);

    /** Initialize DOM refs */
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const canvasParentRef = useRef<HTMLDivElement>(null);
    const addButtonRef = useRef<HTMLButtonElement>(null);
    const stopButtonRef = useRef<HTMLButtonElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    // Start and end times of the new time block
    // in format HH:MM
    const [editStartTime, setEditStartTime] = React.useState<string>('');
    const [editEndTime, setEditEndTime] = React.useState<string>('');
    const editStartTimeRef = useRef(editStartTime);
    const editEndTimeRef = useRef(editEndTime);
    const [editColor, setEditColor] = React.useState<string>('#1095D9');
    const editColorRef = useRef(editColor);
    const [category, setCategory] = React.useState<string>('');

    // Edit mode is for creating a new time block only atm
    const [editMode, setEditMode] = React.useState<boolean>(false);
    const editModeRef = useRef(editMode);

    // Increment time by this many minutes
    const snapTo = 30;

    // Size and position of clock
    const [clockCenter, setClockCenter] = React.useState<Point>({ x: 0, y: 0 });
    const centerRef = useRef(clockCenter);
    const [clockRadius, setClockRadius] = React.useState(0);
    const radiusRef = useRef(clockRadius);
    const radiusOfButton = 24;
    const minClockRadius = 100;

    // Starting point of a new timeblock
    const [startPoint, setStartPoint] = React.useState<Point>({ x: 0, y: 0 });
    // Again, need a ref for event handlers
    const startPointRef = React.useRef(startPoint);
    const [endPoint, setEndPoint] = React.useState<Point>({ x: 0, y: 0 });
    const endPointRef = React.useRef(endPoint);

    // Is there a better way to do this???
    // Using refs atm because the event handlers capture the initial state, not the updated state
    // Therefore we need to update the refs when the state changes
    // And we need state because we need to re-render the component when the state changes
    useEffect(() => {
        editModeRef.current = editMode;
    }, [editMode]);
    useEffect(() => {
        startPointRef.current = startPoint;
    }, [startPoint]);
    useEffect(() => {
        endPointRef.current = endPoint;
    }, [endPoint]);
    useEffect(() => {
        radiusRef.current = clockRadius;
    }, [clockRadius]);
    useEffect(() => {
        centerRef.current = clockCenter;
    }, [clockCenter]);
    useEffect(() => {
        editStartTimeRef.current = editStartTime;
    }, [editStartTime]);
    useEffect(() => {
        editEndTimeRef.current = editEndTime;
    }, [editEndTime]);
    useEffect(() => {
        editColorRef.current = editColor;
    }, [editColor]);

    // Draw the clock and time blocks
    useEffect(() => {
        window.addEventListener("resize", drawLoop, false);

        drawLoop();
    }, [])

    // Initialize the event listeners
    useEffect(() => {
        document.addEventListener("mouseup", handleMouseUp);

        // Cleanup the event listener on component unmount
        return () => {
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, []);

    useEffect(() => {
        document.addEventListener("mousemove", handleMouseMove);

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
        }
    }, [])

    /**
     * @param mousePos The (x,y) coordinates of the mouse
     * @param radius The radius of the circle
     * @returns {Point} The (x,y) coordinates of the intersection point on the circle
     */
    const getPointOnCircle = (mousePos: Point, radius: number, center: Point, snap?: number) : Point => {
        if (canvasRef.current == null) return {x: 0, y: 0};

        const vectorToMouse = {
            x: mousePos.x - center.x - canvasRef.current.offsetLeft,
            y: mousePos.y - center.y - canvasRef.current.offsetTop
        }

        const magnitude = Math.sqrt(vectorToMouse.x * vectorToMouse.x + vectorToMouse.y * vectorToMouse.y);

        const unitVector = {
            x: vectorToMouse.x / magnitude,
            y: vectorToMouse.y / magnitude
        }

        // calculate intersection with circle
        const pointOnCircle = {
            x: center.x + unitVector.x * radius,
            y: center.y + unitVector.y * radius
        }

        if (snap) {
            let angle = Math.atan2(pointOnCircle.y - center.y, pointOnCircle.x - center.x);

            // Convert negative angles to positive (0 to 2 PI)
            // So a negative angle of -PI/2 would be converted to 3PI/2
            if (pointOnCircle.x >= center.x && pointOnCircle.y <= center.y) {
                // Quadrant 1
                angle += Math.PI * 2;
            }
            if (pointOnCircle.x <= center.x && pointOnCircle.y <= center.y) {
                // Quadrant 2
                angle += Math.PI * 2;
            }

            let snap_angle = Math.PI * 2 / (1440 / snap);
            angle = Math.round(angle / snap_angle) * snap_angle;

            pointOnCircle.x = center.x + radius * Math.cos(angle);
            pointOnCircle.y = center.y + radius * Math.sin(angle);
        }

        return pointOnCircle;
    }

    /**
     *
     * @param center (x,y) coordinates of the center of the circle
     * @param radius Radius of that circle
     * @param angle Angle in radians
     * @returns Point on the circle corresponding to that angle
     */
    const getPointFromAngle = (center: Point, radius: number, angle: number) : Point => {
        return {
            x: center.x + radius * Math.cos(angle),
            y: center.y + radius * Math.sin(angle)
        }
    }

    /**
     * @param {Point} center (x,y) coordinates of the center of the circle
     * @param {Point} point (x,y) coordinates of a point on the circle
     * @returns {number} angle in radians
     */
    const getAngleFromPoint = (center: Point, point: Point) : number => {
        return Math.atan2(point.y - center.y, point.x - center.x);
    }

    /**
     * @param {string} time Time in format HH:MM
     * @returns {number} Angle in radians
     */
    const getAngleFromTime = (time: string) : number => {
        // Convert time to radians
        // Subtract by Math.PI / 2 to start at 12 o'clock
        let [hours, minutes] = time.split(":");
        let angle = map(0, 24, 0, Math.PI * 2, parseInt(hours)) - Math.PI / 2;
        return angle;
    }

    /**
     *
     * @param start The (x,y) coordinates on the circle of the starting point
     * @param endPoint The (x,y) coordinates on the circle of the ending point
     * @returns {Wedge}
     */
    const getWedgeFromPoints = (center: Point, start: Point, endPoint: Point, color?: string) : Wedge => {
        // start angle is the angle between the start point and the center of the circle
        let start_angle = Math.atan2(start.y - center.y, start.x - center.x);
        // end angle is the angle between the end point and the center of the circle
        let end_angle = Math.atan2(endPoint.y - center.y, endPoint.x - center.x);


        // Convert negative angles to positive (0 to 2 PI)
        // So a negative angle of -PI/2 would be converted to 3PI/2
        if (start.x >= center.x && start.y <= center.y) {
            // Quadrant 1
            start_angle += Math.PI * 2;
        }
        if (start.x <= center.x && start.y <= center.y) {
            // Quadrant 2
            start_angle += Math.PI * 2;
        }

        // Check if the wedge is backwards
        let clockwise = end_angle < start_angle ? true : false;

        if (clockwise) {
            if (end_angle < 0) {
                end_angle += Math.PI * 2;
                start_angle += Math.PI * 2;
            }
        } else {
            // End angle is greater than start angle, so swap them
            let temp = start_angle;
            start_angle = end_angle;
            end_angle = temp;
        }

        let wedge: Wedge = {
            start_angle,
            end_angle,
            clockwise,
            color: color || "#1095D9"
        }

        return wedge;
    }

    /**
     * Maps an input value from one range to another
     */
    const map = (min: number, max: number, new_min: number, new_max: number, value: number) : number => {
        const range = max - min;
        const new_range = new_max - new_min;
        return (value / range) * new_range + new_min;
    }

    /**
     * Finds if a wedge was hit by a mouse click
     */
    const findTimeBlock = (center: Point, radius: number, point: Point) : TimeBlock | null => {
        const canvas = canvasRef.current;

        if (canvas != null) {
            const ctx = canvas.getContext("2d");

            if (ctx != null) {
                for (let timeBlock of props.schedule.time_blocks) {
                    let start_time = parseInt(timeBlock.start_time);
                    let end_time = parseInt(timeBlock.end_time);

                    let start_angle = map(0, 24, 0, Math.PI * 2, start_time) - Math.PI / 2;
                    let end_angle = map(0, 24, 0, Math.PI * 2, end_time) - Math.PI / 2;

                    ctx.beginPath();
                    ctx.moveTo(center.x, center.y);
                    ctx.arc(center.x, center.y, radius, start_angle, end_angle, false);
                    ctx.closePath();

                    if (ctx.isPointInPath(point.x, point.y)) {
                        return timeBlock;
                    }
                }
            }
        }

        return null;
    }

    const isPointInWedge = (center: Point, radius: number, wedge: Wedge, point: Point) : boolean => {
        let angle = getAngleFromPoint(center, point);

        if (point.x >= center.x && point.y <= center.y) {
            // Quadrant 1
            angle += Math.PI * 2;
        }
        if (point.x <= center.x && point.y <= center.y) {
            // Quadrant 2
            angle += Math.PI * 2;
        }

        while (wedge.start_angle > Math.PI * 2) {
            wedge.start_angle -= Math.PI * 2;
        }
        while (wedge.end_angle > Math.PI * 2) {
            wedge.end_angle -= Math.PI * 2;
        }

        if (wedge.end_angle < 0) {
            wedge.end_angle += Math.PI * 2;
            wedge.start_angle += Math.PI * 2;
        }

        if (angle < wedge.start_angle || angle > wedge.end_angle) {
            return false;
        }

        return true;
    }

    /**
     * Handles the selection of a time block
     */
    const handleMouseUp = (e: MouseEvent) => {
        if (!editModeRef.current) {
            // enterEditMode(e);
            if (e.target == canvasRef.current) {
                const timeBlock = findTimeBlock(centerRef.current, radiusRef.current, {x: e.clientX, y: e.clientY});
                if (timeBlock && timeBlock.id != undefined) {
                    router.push(`/dashboard/schedule/timeblock/${timeBlock.id}`);
                }
            }
        } else {
            if (e.target !== modalRef.current && !modalRef.current?.contains(e.target as Node)) {
                exitEditMode(e);
            }
            e.stopPropagation();
        }
    };

    /**
     * Draws the wedge for a new time block on the canvas
     * @TODO Show the start and end times at edge of wedge
     */
    const handleMouseMove = (e: MouseEvent) => {
        // Check if mouse is in canvas
        if (e.target != canvasRef.current) {
            return;
        }

        if (editModeRef.current) {
            const canvas = canvasRef.current;
            if (canvas != null) {
                const ctx = canvas.getContext("2d");

                let pointOnCircle = getPointOnCircle({x: e.clientX, y: e.clientY}, radiusRef.current, centerRef.current, snapTo);

                let wedge = getWedgeFromPoints(centerRef.current, startPointRef.current, pointOnCircle, editColorRef.current);

                // Convert the angles to be within the range [0, 2 PI]
                while (wedge.start_angle > Math.PI * 2) {
                    wedge.start_angle -= Math.PI * 2;
                }
                while (wedge.end_angle > Math.PI * 2) {
                    wedge.end_angle -= Math.PI * 2;
                }

                // Convert the angles to 24 hr time, add 6 to start at top of clock
                let start_time = map(0, Math.PI * 2, 0, 24, wedge.start_angle) + 6;
                let end_time = map(0, Math.PI * 2.0, 0, 24, wedge.end_angle) + 6;

                if (start_time > 24) {
                    start_time -= 24;
                }
                if (end_time > 24) {
                    end_time -= 24;
                }

                // If the start time is greater than the end time, swap them
                // UNLESS we're crossing the top of the clock (from PM to AM)
                if (start_time > end_time
                    && (wedge.end_angle < 3*Math.PI/2 && wedge.start_angle < 3*Math.PI/2)
                ) {
                    let temp = start_time;
                    start_time = end_time;
                    end_time = temp;
                }

                let string_start_time = convertFloatToTime(start_time, snapTo);
                let string_end_time = convertFloatToTime(end_time, snapTo);

                setEditStartTime(string_start_time);
                setEditEndTime(string_end_time);

                // draw wedge
                if (ctx != null) {
                    ctx.reset();
                    drawLoop();
                    drawWedge(ctx, centerRef.current, radiusRef.current, wedge);
                }

                // move stop button
                if (stopButtonRef.current) {
                    stopButtonRef.current.style.display = "block";
                    let pointOutsideClock = getPointOnCircle({x: e.clientX, y: e.clientY}, radiusRef.current + 40, centerRef.current, snapTo);

                    // adjust button position based on width / height of button
                    stopButtonRef.current.style.left = `${pointOutsideClock.x + canvas.offsetLeft - radiusOfButton}px`;
                    stopButtonRef.current.style.top = `${pointOutsideClock.y + canvas.offsetTop - radiusOfButton}px`;
                }
            }

            return;

        }

        // Move the add button
        if (addButtonRef.current && canvasRef.current) {
            let pointOutsideClock = getPointOnCircle({x: e.clientX, y: e.clientY}, radiusRef.current + 40, centerRef.current, snapTo);

            // adjust button position based on width / height of button
            addButtonRef.current.style.left = `${pointOutsideClock.x + canvasRef.current.offsetLeft - radiusOfButton}px`;
            addButtonRef.current.style.top = `${pointOutsideClock.y + canvasRef.current.offsetTop - radiusOfButton}px`;
        }

        // Hover effect for wedges
        const canvas = canvasRef.current;
        if (canvas != null) {
            let found = false;
            const ctx = canvas.getContext("2d");
            for (let wedge of wedgesRef.current) {
                if (isPointInWedge(centerRef.current, radiusRef.current, wedge, {x: e.clientX, y: e.clientY})) {
                    // Highlight the wedge
                    canvas.style.cursor = "pointer";
                    found = true;

                    // Create a color that is slightly darker than the original
                    let parsed = wedge.color.split("#");
                    let newColor = wedge.color;
                    if (parsed.length > 1) {
                        let color = parsed[1];
                        let first = parseInt(color.substring(0, 2), 16);
                        let second = parseInt(color.substring(2, 4), 16);
                        let third = parseInt(color.substring(4, 6), 16);
                        newColor = `#${(Math.abs(first - 50)).toString(16)}${(Math.abs(second - 50)).toString(16)}${(Math.abs(third - 50)).toString(16)}`;
                    }

                    if (ctx != null) {
                        drawWedge(ctx, centerRef.current, radiusRef.current, wedge, newColor);
                    }
                } else {
                    // Return wedge to normal
                    if (ctx != null) {
                        ctx.fillStyle = wedge.color;
                        drawWedge(ctx, centerRef.current, radiusRef.current, wedge);
                    }
                }
            }
            if (!found) {
                canvas.style.cursor = "default";
            }
        }
    }

    /**
     * Enter edit mode and start a new time block
     */
    const enterEditMode = (e: any) => {
        // Start a new time block
        let startPoint = getPointOnCircle({x: e.clientX, y: e.clientY}, radiusRef.current, centerRef.current);
        setStartPoint(startPoint);

        setEditMode(true);

        if (addButtonRef.current)
            addButtonRef.current.style.opacity = "1";
    }

    /**
     * Exit edit mode and create the time block
     * @TODO Switch to server actions when ready
     * @TOOO Update the wedgesRef so hover effects workkk
     */
    const exitEditMode = async (e: any) => {
        // Open the modal to add category and any other info
        // router.push(`/dashboard/schedule/timeblock/create?start_time=${editStartTime}&end_time=${editEndTime}`);


        // Call server action to create time block
        // let formData = new FormData();
        // formData.append('start_time', editStartTime);
        // formData.append('end_time', editEndTime);
        // formData.append('category', category);
        // formData.append('color', editColor);

        // const timeBlock = await createTimeBlock(formData);

        // Optimistically add the time block to the schedule
        let timeBlock: TimeBlock = {
            id: 0,
            start_time: editStartTime,
            end_time: editEndTime,
            color: editColor,
            category: category
        }

        props.schedule.time_blocks.push(timeBlock);

        setEditMode(false);

        if (stopButtonRef.current) stopButtonRef.current.style.display = "none";
    }

    /**
     *
     * @param {string} value Time in format HH:MM
     * @param {number} min Minimum time in hours
     * @param {number} max Maximum time in hours
     * @param {number} step Interval between times on clock
     * @returns
     */
    const roundTime = (value: string, min: number, max: number, step: number) => {
        let [hours, mins] = value.split(":");
        // Round to nearest half hour
        let roundedMins = Math.round(parseInt(mins) / step) * step;

        let string_hours = hours;
        let string_minutes = roundedMins.toString();
        if (parseInt(hours) < 10) {
            string_hours = `0${string_hours}`;
        }
        if (roundedMins < 10) {
            string_minutes = `0${string_minutes}`;
        }
        return `${string_hours}:${string_minutes}`;
    }

    /**
     * @param {string} time Time in hours (0-24), can be float
     * @param {number} step Interval between times on clock
     * @returns {string} Time in format HH:MM
     */
    const convertFloatToTime = (time: number, step: number) => {
        let hours = Math.floor(time);
        let minutes = Math.floor((time - hours) * 60);

        // Round minutes to nearest half hour
        minutes = Math.round(minutes / step) * step;

        if (minutes >= 60) {
            minutes = 0;
            hours += 1;
        }
        let string_hours = hours.toString();
        let string_minutes = minutes.toString();
        if (hours < 10) {
            string_hours = `0${string_hours}`;
        }
        if (minutes < 10) {
            string_minutes = `0${string_minutes}`;
        }

        return `${string_hours}:${string_minutes}`;
    }

    /******** CREATE WEDGE FORM HANDLERS ********/

    const onChangeStartTimeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Round to nearest half hour
        let roundedTime = roundTime(e.target.value, 0, 24, snapTo);
        setEditStartTime(roundedTime);

        // Update wedge
        let angle = getAngleFromTime(roundedTime);
        let new_point = getPointFromAngle(centerRef.current, radiusRef.current, angle);
        let wedge = getWedgeFromPoints(centerRef.current, startPointRef.current, new_point, editColorRef.current);

        let ctx = canvasRef.current?.getContext("2d");
        if (ctx != null) {
            ctx.reset();
            drawLoop();
            drawWedge(ctx, centerRef.current, radiusRef.current, wedge);
        }
    }

    const onChangeEndTimeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        let roundedTime = roundTime(e.target.value, 0, 24, snapTo);
        setEditEndTime(roundedTime);

        // Update wedge
        let angle = getAngleFromTime(roundedTime);
        let new_point = getPointFromAngle(centerRef.current, radiusRef.current, angle);
        let wedge = getWedgeFromPoints(centerRef.current, startPointRef.current, new_point, editColorRef.current);

        let ctx = canvasRef.current?.getContext("2d");
        if (ctx != null) {
            ctx.reset();
            drawLoop();
            drawWedge(ctx, centerRef.current, radiusRef.current, wedge);
        }
    }

    const onChangeColor = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditColor(e.target.value);

        let wedge = getWedgeFromPoints(centerRef.current, startPointRef.current, endPointRef.current, e.target.value);

        let ctx = canvasRef.current?.getContext("2d");
        if (ctx != null) {
            ctx.reset();
            drawLoop();
            drawWedge(ctx, centerRef.current, radiusRef.current, wedge);
        }
    }

    const onChangeCategory = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCategory(e.target.value);
    }

    /**
     * Draws a given wedge in a circle with a certain radius
     * @param ctx Canvas context to draw on
     * @param center Center of circle
     * @param radius Radius of the circle
     * @param wedge Wedge to draw
     */
    const drawWedge = (ctx: CanvasRenderingContext2D, center: Point, radius: number, wedge: Wedge, newColor?: string) => {
        ctx.fillStyle = newColor || wedge.color;
        ctx.beginPath();
        ctx.moveTo(center.x, center.y);
        ctx.arc(center.x, center.y, radius, wedge.start_angle, wedge.end_angle, !wedge.clockwise);
        ctx.closePath();
        ctx.fill();
    }

    /**
     * Draws the clock and all time blocks on the canvas
     * @TODO Make start and end time dates, not just numbers
     */
    const drawLoop = () => {
        const canvas = canvasRef.current;

        if (canvas?.getContext) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            // this was part of an experiment to use flex box to put clock and modal side by side
            // if (canvasParentRef.current == null) {
            //     canvas.width = window.innerWidth;
            //     canvas.height = window.innerHeight;
            // } else {
            //     canvas.width = canvasParentRef.current.clientWidth;
            //     canvas.height = canvasParentRef.current.clientHeight;
            // }
            let rad = Math.min(canvas.width, canvas.height) / 2 - minClockRadius;
            // Minimum clock radius
            if (rad < minClockRadius) rad = minClockRadius;
            // Center the clock
            let center = { x: canvas.width / 2, y: canvas.height / 2 };
            // Don't let clock go off left or top of screen
            if (center.x < minClockRadius) center.x = minClockRadius;
            if (center.y < minClockRadius) center.y = minClockRadius;
            setClockRadius(rad);
            setClockCenter(center);

            const ctx = canvas.getContext("2d");

            if (ctx != null) {
                // Add clock outline
                ctx.strokeStyle = "white";
                ctx.beginPath();
                ctx.arc(center.x, center.y, rad, 0, 2 * Math.PI);
                ctx.stroke();

                // Add clock numbers
                for (let i = 0; i < 24; i++) {
                    // Add hours
                    let angle = map(0, 24, 0, Math.PI * 2, i) - Math.PI / 2;
                    let point = getPointFromAngle(center, rad + 40, angle);

                    ctx.font = "20px Arial";
                    ctx.fillStyle = "white";
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillText(`${i}`, point.x, point.y);
                }
                for (let i = 0; i < 48; i++ ) {
                    // Add half hours
                    if (i % 2 == 0) continue;
                    let angle = map(0, 48, 0, Math.PI * 2, i) - Math.PI / 2;
                    let point = getPointFromAngle(center, rad + 40, angle);

                    ctx.font = "12px Arial";
                    ctx.fillStyle = "gray";
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillText(`${Math.floor(i / 2)}:30`, point.x, point.y);
                }
            }

            // Add all time blocks to the clock
            let wedges: Wedge[] = [];
            for (let timeBlock of props.schedule.time_blocks) {
                let start_angle = getAngleFromTime(timeBlock.start_time);
                let end_angle = getAngleFromTime(timeBlock.end_time);

                // Add time block info to wedges
                let wedge: Wedge = {
                    start_angle,
                    end_angle,
                    clockwise: true,
                    color: timeBlock.color
                }
                wedges.push(wedge)

                // Draw it
                if (ctx != null) {
                    drawWedge(ctx, center, rad, wedge);
                }

            }

            wedgesRef.current = wedges;
        }
    }

    return (
        <section>
            <button ref={addButtonRef} id="start-add-button" className={styles.add_button} onClick={enterEditMode}>+</button>
            <button ref={stopButtonRef} id="stop-add-button" className={styles.stop_button} onClick={exitEditMode}></button>
            <div className={styles.clock_info}>
                <div className={styles.clock} ref={canvasParentRef}>
                    <canvas ref={canvasRef} id="canvas"></canvas>
                    <div className={styles.modal} ref={modalRef}>
                        {editMode ? <CreateTimeBlockForm
                            showSubmit={false}
                            endTime={editEndTime}
                            startTime={editStartTime}
                            color={editColor}
                            category={category}
                            onChangeEndTimeHandler={onChangeEndTimeHandler}
                            onChangeStartTimeHandler={onChangeStartTimeHandler}
                            onChangeColorHandler={onChangeColor}
                            onChangeCategoryHandler={onChangeCategory}/>
                        : null}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Clock;