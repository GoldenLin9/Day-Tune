'use client';

import React, { useEffect, useRef } from 'react';
import { Schedule, TimeBlock } from '@/types';
import { useRouter } from 'next/navigation'

import styles from './clock.module.css';

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
    clockwise: boolean
}

const Clock: React.FC<ClockProps> = (props: ClockProps) => {
    const router = useRouter();

    // Display more info about the selected time block
    const [selectedTimeBlock, setSelectedTimeBlock] = React.useState<TimeBlock | null>(null);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const addButtonRef = useRef<HTMLButtonElement>(null);
    const stopButtonRef = useRef<HTMLButtonElement>(null);

    // Enable mouse down / mouse move events in edit mode
    const [editMode, setEditMode] = React.useState<boolean>(false);
    // Use a ref so event handlers can get the current value of editMode
    const editModeRef = useRef(editMode);

    // Size and position of clock
    const [clockCenter, setClockCenter] = React.useState<Point>({ x: 0, y: 0 });
    const centerRef = useRef(clockCenter);
    const [clockRadius, setClockRadius] = React.useState(0);
    const radiusRef = useRef(clockRadius);

    // Starting point of a new timeblock
    const [startPoint, setStartPoint] = React.useState<Point>({ x: 0, y: 0 });
    // Again, need a ref for event handlers
    const startPointRef = React.useRef(startPoint);

    // Update the refs
    useEffect(() => {
        editModeRef.current = editMode;
    }, [editMode]);
    useEffect(() => {
        startPointRef.current = startPoint;
    }, [startPoint]);
    useEffect(() => {
        radiusRef.current = clockRadius;
    }, [clockRadius]);
    useEffect(() => {
        centerRef.current = clockCenter;
    }, [clockCenter]);

    // Draw the clock and time blocks
    useEffect(() => {
        window.addEventListener("resize", drawLoop, false);

        drawLoop();
    }, [])

    // Initialize the event listeners
    useEffect(() => {
        document.addEventListener("mousedown", handleMouseDown);

        // Cleanup the event listener on component unmount
        return () => {
            document.removeEventListener("mousedown", handleMouseDown);
        };
    }, []);

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

            angle = Math.round(angle / snap) * snap;

            pointOnCircle.x = center.x + radius * Math.cos(angle);
            pointOnCircle.y = center.y + radius * Math.sin(angle);
        }

        return pointOnCircle;
    }

    const getPointFromAngle = (center: Point, radius: number, angle: number) : Point => {
        return {
            x: center.x + radius * Math.cos(angle),
            y: center.y + radius * Math.sin(angle)
        }
    }

    /**
     *
     * @param start The (x,y) coordinates on the circle of the starting point
     * @param endPoint The (x,y) coordinates on the circle of the ending point
     * @returns {Wedge}
     */
    const getWedgeFromPoints = (center: Point, start: Point, endPoint: Point) : Wedge => {
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
            clockwise
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

    /**
     * Handles the creation of a new time block
     */
    const handleMouseDown = (e: MouseEvent) => {
        if (!editModeRef.current) {
            // enterEditMode(e);
        } else {
            exitEditMode(e);
        }
    };

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

                let pointOnCircle = getPointOnCircle({x: e.clientX, y: e.clientY}, radiusRef.current, centerRef.current, Math.PI / 24);

                let wedge = getWedgeFromPoints(centerRef.current, startPointRef.current, pointOnCircle);

                // draw wedge
                if (ctx != null) {
                    ctx.reset();
                    drawLoop();
                    ctx.fillStyle = "#1095D9";
                    ctx.beginPath();
                    ctx.moveTo(centerRef.current.x, centerRef.current.y);
                    ctx.arc(centerRef.current.x, centerRef.current.y, radiusRef.current, wedge.start_angle, wedge.end_angle, !wedge.clockwise);
                    ctx.closePath();
                    ctx.fill();
                }

                // move stop button
                if (stopButtonRef.current) {
                    stopButtonRef.current.style.display = "block";
                    let pointOutsideClock = getPointOnCircle({x: e.clientX, y: e.clientY}, radiusRef.current + 50, centerRef.current, Math.PI / 24);

                    // adjust button position based on width / height of button
                    stopButtonRef.current.style.left = `${pointOutsideClock.x + canvas.offsetLeft - 32}px`;
                    stopButtonRef.current.style.top = `${pointOutsideClock.y + canvas.offsetTop - 32}px`;
                }
            }
        } else if (addButtonRef.current && canvasRef.current) {
            let pointOutsideClock = getPointOnCircle({x: e.clientX, y: e.clientY}, radiusRef.current + 50, centerRef.current, Math.PI / 24);

            // adjust button position based on width / height of button
            addButtonRef.current.style.left = `${pointOutsideClock.x + canvasRef.current.offsetLeft - 32}px`;
            addButtonRef.current.style.top = `${pointOutsideClock.y + canvasRef.current.offsetTop - 32}px`;

            return;
        }

    }

    /** Displays information about time block with button to edit/delete */
    const handleOnClick = (timeBlock: TimeBlock) => {
        setSelectedTimeBlock(timeBlock);
    }

    const enterEditMode = (e: any) => {
        // Start a new time block
        let startPoint = getPointOnCircle({x: e.clientX, y: e.clientY}, radiusRef.current, centerRef.current);

        setStartPoint(startPoint);

        setEditMode(true);
    }


    const exitEditMode = (e: any) => {
        // Finish the new time block
        let endPoint = getPointOnCircle({x: e.clientX, y: e.clientY}, radiusRef.current, centerRef.current, Math.PI / 24);

        let wedge = getWedgeFromPoints(centerRef.current, startPointRef.current, endPoint);

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
        // Open the modal to add category and any other info
        router.push(`/dashboard/schedule/timeblock/create?start_time=${start_time}&end_time=${end_time}`);

        setEditMode(false);

        if (stopButtonRef.current) stopButtonRef.current.style.display = "none";
    }

    /**
     * Draws the clock and all time blocks on the canvas
     * @TODO Make start and end time dates, not just numbers
     */
    const drawLoop = () => {
        const canvas = canvasRef.current;

        if (canvas?.getContext) {
            canvas.width = window.innerWidth - 100;
            canvas.height = window.innerHeight - 100;
            let rad = Math.min(canvas.width, canvas.height) / 2 - 100;
            let center = { x: canvas.width / 2, y: canvas.height / 2 };
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
            for (let timeBlock of props.schedule.time_blocks) {
                let start_time = parseInt(timeBlock.start_time);
                let end_time = parseInt(timeBlock.end_time);

                // Convert time to radians
                // Subtract by Math.PI / 2 to start at 12 o'clock
                let start_angle = map(0, 24, 0, Math.PI * 2, start_time) - Math.PI / 2;
                let end_angle = map(0, 24, 0, Math.PI * 2, end_time) - Math.PI / 2;

                if (ctx != null) {
                    ctx.fillStyle = timeBlock.color;
                    ctx.beginPath();
                    ctx.moveTo(center.x, center.y);
                    ctx.arc(center.x, center.y, rad, start_angle, end_angle, false);
                    ctx.closePath();
                    ctx.fill();
                }
            }
        }
    }

    return (
        <section>
            <button ref={addButtonRef} id="start-add-button" className={styles.add_button} onClick={enterEditMode}>+</button>
            <button ref={stopButtonRef} id="stop-add-button" className={styles.stop_button} onClick={exitEditMode}>S</button>
            <canvas ref={canvasRef} id="canvas"></canvas>
        </section>
    )
}

export default Clock;