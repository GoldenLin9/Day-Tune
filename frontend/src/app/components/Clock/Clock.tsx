'use client';

import React, { useEffect, useRef } from 'react';
import { Schedule, TimeBlock } from '@/types';
import { useRouter } from 'next/navigation'

import styles from './Clock.module.css';
import CreateTimeBlockForm from '../Forms/CreateTimeBlock';
import { createTimeBlock } from '@/app/actions/TimeBlock';
import CreateTimeBlockPartialForm from '../Forms/CreateTimeBlockPartial';
import TimeBlockModal from '../Modals/TimeBlock/TimeBlockModal';
import { toast } from 'react-toastify';

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
    color: string,
    category: string,
    timeblock_id: number,
    depth: number
}

const initialState = {
    'message': ''
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
    const [editColor, setEditColor] = React.useState<string>('#1095D9');
    const [category, setCategory] = React.useState<string>('');
    const [editDepth, setEditDepth] = React.useState<number>(0);
    const editColorRef = useRef(editColor);
    const categoryRef = useRef(category);
    const editDepthRef = useRef<number>(editDepth);
    const editParentRef = useRef<Wedge | null>(null);

    // Edit mode is for creating a new time block only atm
    // Need a state for showing the create form, and a ref for event handlers/animation loop
    const [editMode, setEditMode] = React.useState<boolean>(false);
    const editModeRef = useRef(editMode);
    const [showForm, setShowForm] = React.useState<boolean>(false);
    const showFormRef = useRef(showForm);

    const [editState, setEditState] = React.useState(initialState);

    // Increment time by this many minutes
    const [snapTo, setSnapTo] = React.useState<number>(10);
    const snapToRef = useRef(snapTo);

    // Clock details
    const centerRef = useRef({ x: 0, y: 0 });
    const radiusRef = useRef(0);
    const radiusOfButton = 15;
    const minClockRadius = 100;

    const treeHeightRef = React.useRef(0);

    // Start point of a new timeblock
    const startPointRef = React.useRef({ x: 0, y: 0 });
    const endPointRef = React.useRef({ x: 0, y: 0 });

    // Track mouse movement
    const mousePosRef = React.useRef({x: 0, y: 0});

    useEffect(() => {
        editModeRef.current = editMode;
    }, [editMode]);
    useEffect(() => {
        editColorRef.current = editColor;
    }, [editColor]);
    useEffect(() => {
        categoryRef.current = category;
    }, [category]);
    useEffect(() => {
        showFormRef.current = showForm;
    }, [showForm]);
    useEffect(() => {
        snapToRef.current = snapTo;
    }, [snapTo])

    // Initialize the canvas
    useEffect(() => {
        const animationLoop = requestAnimationFrame(drawLoop);

        return () => {
            cancelAnimationFrame(animationLoop);
        }
    }, [])

    // Initialize the event listeners
    useEffect(() => {
        window.addEventListener("resize", resizeCanvas);

        resizeCanvas();

        return () => {
            window.removeEventListener("resize", resizeCanvas);
        }
    }, []);

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
     * @TODO Fix height of tree going down one on page rerender after adding a time block
     */
    useEffect(() => {
        treeHeightRef.current = getHeightOfTree(props.schedule.time_blocks, 1);
    }, [props.schedule.time_blocks])

    const getHeightOfTree = (timeBlocks: TimeBlock[], depth: number) => {
        let max = depth;
        for (let timeblock of timeBlocks) {
            let height = getHeightOfTree(timeblock.children, depth + 1);
            if (height > max) {
                max = height;
            }
        }
        return max;
    }

    /**
     * @param mousePos The (x,y) coordinates of the mouse
     * @param radius The radius of the circle
     * @returns {Point} The (x,y) coordinates of the intersection point on the circle
     */
    const getPointOnCircle = (mousePos: Point, radius: number, center: Point, snap?: number): Point => {
        if (canvasRef.current == null) return { x: 0, y: 0 };

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
            // let angle = getAngleFromPoint(center, pointOnCircle);
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
    const getPointFromAngle = (center: Point, radius: number, angle: number): Point => {
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
    const getAngleFromPoint = (center: Point, point: Point): number => {
        let angle = Math.atan2(point.y - center.y, point.x - center.x);
        // let compassRadians = Math.PI / 2 + angle;
        let compassDegrees = (180 / Math.PI) * angle;
        let normalizedAngle = ((compassDegrees % 360) + 360) % 360;
        let normalizedRadians = (normalizedAngle * Math.PI) / 180;
        return normalizedRadians;
    }

    /**
     * Requires different logic than getAngleFromPoint because the start and end points must be connected
     * not by the shortest path but in the direction of the user's mouse movement
     * @param start The (x,y) coordinates on the circle of the starting point
     * @param endPoint The (x,y) coordinates on the circle of the ending point
     * @returns {Wedge}
     */
    const getAnglesFromPoints = (center: Point, start: Point, endPoint: Point) => {
        let start_angle = getAngleFromPoint(center, start);
        let end_angle = getAngleFromPoint(center, endPoint);

        let clockwise = end_angle < start_angle ? true : false;

        if (!clockwise) {
            let temp = start_angle;
            start_angle = end_angle;
            end_angle = temp;
        }

        return {
            start_angle,
            end_angle,
            clockwise
        }
    }

    /**
     * @param {string} time Time in format HH:MM
     * @returns {number} Angle in radians
     */
    const getAngleFromTime = (time: string): number => {
        // Subtract 6 hours to start at top of clock
        let float_time = convertTimeToFloat(time) - 6;
        if (float_time < 0) { float_time += 24; }
        let angle = map(0, 24, 0, Math.PI * 2, float_time);
        return angle;
    }

    /**
     * Returns the start and end times of a time block given two points on the clock in HH:MM format
     * @param start_point (x, y) coordinate of a point on the clock edge
     * @param end_point (x, y) coordinate of a point on the clock edge
     * @returns an object of the format {start_time: string, end_time: string}
     */
    const getTimesFromPoints = (start_point: Point, end_point: Point) => {
        let { start_angle, end_angle, clockwise } = getAnglesFromPoints(centerRef.current, start_point, end_point);

        // Convert the angles to 24 hr time, add 6 to start at top of clock
        let start_time = map(0, Math.PI * 2, 0, 24, start_angle) + 6;
        let end_time = map(0, Math.PI * 2.0, 0, 24, end_angle) + 6;
        start_time = start_time % 24;
        end_time = end_time % 24;

        // If angles were swapped, swap the times
        if (!clockwise) {
            let temp = start_time;
            start_time = end_time;
            end_time = temp;
        }

        let string_start_time = convertFloatToTime(start_time, snapToRef.current);
        let string_end_time = convertFloatToTime(end_time, snapToRef.current);

        return { string_start_time, string_end_time }
    }

    /**
     * Maps an input value from one range to another
     */
    const map = (min: number, max: number, new_min: number, new_max: number, value: number): number => {
        const range = max - min;
        const new_range = new_max - new_min;
        return (value / range) * new_range + new_min;
    }

    /**
     * Finds if a wedge was hit by a mouse click
     */
    const findTimeBlock = (center: Point, radius: number, point: Point): TimeBlock | null => {
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
     * Takes in the start and end angles of a wedge and determines whether a given point is inside the wedge
     * @param center Center of circle
     * @param radius Radius of circle
     * @param start_angle Start angle of wedge
     * @param end_angle End angle of wedge
     * @param point Point to check
     */
    const isPointInWedge = (center: Point, minRadius: number, maxRadius: number, start_angle: number, end_angle: number, point: Point): boolean => {
        let angle = getAngleFromPoint(center, point);

        // In the case of the wedge crossing the 0/2PI boundary:
        if (start_angle > end_angle) {
            // If angle is between start angle and 2PI
            if (angle > start_angle && angle < Math.PI * 2) {
                return true;
            }
            // If angle is between 0 and end angle
            if (angle < end_angle && angle > 0) {
                return true;
            }
        }

        if (angle < start_angle || angle > end_angle) {
            return false;
        }

        // Test distance (in the case of children)
        let distance = Math.sqrt((point.x - center.x) * (point.x - center.x) + (point.y - center.y) * (point.y - center.y));

        if (distance >= minRadius && distance <= maxRadius) {
            return true;
        }

        return false;
    }

    const isPointInCircle = (point: Point, center: Point, minRadius: number, maxRadius: number) => {
        let distance = Math.sqrt((point.x - center.x) * (point.x - center.x) + (point.y - center.y) * (point.y - center.y));

        return distance >= minRadius && distance <= maxRadius;
    }

    /**
     * Handles the selection of a time block
     */
    const handleMouseUp = (e: MouseEvent) => {
        if (!editModeRef.current) {
            // enterEditMode(e);
            if (e.target == canvasRef.current) {
                const timeBlock = findTimeBlock(centerRef.current, radiusRef.current, { x: e.clientX, y: e.clientY });
                if (timeBlock && timeBlock.id != undefined) {
                    router.push(`/dashboard/schedule/timeblock/${timeBlock.id}`);
                }
            }
        } else if (e.target != stopButtonRef.current) {
            setEditMode(false);
            if (stopButtonRef.current) stopButtonRef.current.style.display = "none";
        }
    };

    /**
     * Draws the wedge for a new time block on the canvas
     */
    const handleMouseMove = (e: MouseEvent) => {
        mousePosRef.current = { x: e.clientX, y: e.clientY };

        if (editModeRef.current && canvasRef.current) {
            // move stop button
            if (stopButtonRef.current) {
                stopButtonRef.current.style.display = "block";
                let pointOutsideClock = getPointOnCircle({ x: e.clientX, y: e.clientY }, radiusRef.current + 80, centerRef.current, snapToRef.current);

                // adjust button position based on width / height of button
                stopButtonRef.current.style.left = `${pointOutsideClock.x + canvasRef.current.offsetLeft - radiusOfButton}px`;
                stopButtonRef.current.style.top = `${pointOutsideClock.y + canvasRef.current.offsetTop - radiusOfButton}px`;
            }
        } else {
            // Move the add button
            if (addButtonRef.current && canvasRef.current) {
                let pointOutsideClock = getPointOnCircle({ x: e.clientX, y: e.clientY }, radiusRef.current + 80, centerRef.current, snapToRef.current);

                // adjust button position based on width / height of button
                addButtonRef.current.style.left = `${pointOutsideClock.x + canvasRef.current.offsetLeft - radiusOfButton}px`;
                addButtonRef.current.style.top = `${pointOutsideClock.y + canvasRef.current.offsetTop - radiusOfButton}px`;
            }
        }
    }

    const shiftColorValue = (color: string, shift: number) => {
        let parsed = color.split("#");
        if (parsed.length > 1) {
            let color = parsed[1];
            let first = Math.min(255, parseInt(color.substring(0, 2), 16) + shift);
            let second = Math.min(255, parseInt(color.substring(2, 4), 16) + shift);
            let third = Math.min(255, parseInt(color.substring(4, 6), 16) + shift);
            return `#${first.toString(16)}${second.toString(16)}${third.toString(16)}`;
        }
        return color;
    }

    /**
     * Enter edit mode and start a new time block
     */
    const enterEditMode = (e: any) => {
        // Start a new time block
        let startPoint = getPointOnCircle({ x: e.clientX, y: e.clientY }, radiusRef.current, centerRef.current, snapTo);
        startPointRef.current = startPoint;

        for (let wedge of wedgesRef.current) {
            if (isPointInWedge(centerRef.current, 0, radiusRef.current, wedge.start_angle, wedge.end_angle, startPoint)) {
                editParentRef.current = wedge;
            }
        }

        let times = getTimesFromPoints(startPoint, startPoint);
        setEditStartTime(times.string_start_time)
        setEditEndTime(times.string_end_time)

        // Enable clock editing
        setEditMode(true);

        if (addButtonRef.current)
            addButtonRef.current.style.opacity = "1";
    }

    /**
     * Exit edit mode and show the form to add the time block
     */
    const exitEditMode = async (e: any) => {
        // Open the modal to add category and any other info
        setShowForm(true);
        // Stop clock editing
        setEditMode(false);
        // Hide stop button
        if (stopButtonRef.current) stopButtonRef.current.style.display = "none";

        if (editParentRef.current) {
            if (!isPointInWedge(centerRef.current, 0, radiusRef.current, editParentRef.current.start_angle, editParentRef.current.end_angle, endPointRef.current)) {
                editParentRef.current = null;
            }
        }
    }

    /**
     * @TODO Implement server actions
     */
    const onSubmitCreateTimeBlock = async (formData: FormData) => {
        // let formData = new FormData();
        formData.append('start_time', editStartTime);
        formData.append('end_time', editEndTime);
        // formData.append('category', data.category);
        // formData.append('color', editColor);
        console.log(formData)

        // const timeBlock = await createTimeBlock(formData);

        let timeBlock: TimeBlock = {
            id: 0,
            start_time: editStartTime,
            end_time: editEndTime,
            color: editColor,
            category: category,
            children: []
        }

        if (timeBlock) {
            props.schedule.time_blocks = insertTimeBlock(timeBlock, props.schedule.time_blocks, 0);
            treeHeightRef.current = getHeightOfTree(props.schedule.time_blocks, 1);
            setShowForm(false);
        }
    }

    /**
     * Searches timeblocks for a parent to insert the new timeblock into
     * @param insertBlock The timeblock to be inserted
     * @param timeBlocks The array of timeblocks to insert into
     * @param depth The current depth of the timeblock
     * @returns The updated timeblocks
     */
    const insertTimeBlock = (insertBlock: TimeBlock, timeBlocks: TimeBlock[], depth: number) => {
        // check if timeBlock is a child of any of the given timeblocks
        for (let timeblock of timeBlocks) {
            let result = getRelationTo(insertBlock, timeblock);
            if (result.error) {
                toast.error(result.error);
                return timeBlocks;
            }
            if (result.isChild) {
                // Find whether the new block can be a child of this block's children
                timeblock.children = insertTimeBlock(insertBlock, timeblock.children, depth + 1);
                return timeBlocks;
            }
            if (result.isParent) {
                // Make this timeblock a child of the block we're inserting
                insertBlock.children.push(timeblock);
                // Remove this timeblock as a child of its parent
                timeBlocks = timeBlocks.filter((block) => block !== timeblock);
            }
        }
        // if not, just push it to the timeblocks
        timeBlocks.push(insertBlock);
        toast.info(`Time block added at depth: ${depth}`);
        return timeBlocks;
    }

    /**
     * Finds whether the first timeblock is a child or parent of the second timeblock
     * Returns an error if the timeblocks overlap exactly
     * @returns {Object} {isChild: boolean, isParent: boolean, error: string}
     */
    const getRelationTo = (first: TimeBlock, second: TimeBlock) => {
        let start_time = convertTimeToFloat(first.start_time);
        let end_time = convertTimeToFloat(first.end_time);
        let second_start_time = convertTimeToFloat(second.start_time);
        let second_end_time = convertTimeToFloat(second.end_time);

        if (start_time == second_start_time && end_time == second_end_time) {
            return {
                error: "Timeblocks cannot line up exactly",
            };
        }

        // check if parent block crosses midnight
        if (second_start_time > second_end_time) {
            if (start_time > end_time) {
                // if both are on the same side of midnight
                second_start_time -= 24;
                start_time -= 24;
            } else if (start_time > 0 && start_time < second_end_time) {
                // if new block is after midnight
                second_start_time -= 24;
            }
            else if (end_time > second_start_time) {
                // if new block is before midnight
                second_end_time += 24;
            }
        }

        // Check if first is a child of the second
        if (start_time > second_start_time && start_time < second_end_time
            && end_time > second_start_time && end_time < second_end_time) {
            return {
                isChild: true
            };
        }

        if (start_time == second_start_time && end_time < second_end_time) {
            return {
                isChild: true
            };
        }

        if (start_time > second_start_time && end_time == second_end_time) {
            return {
                isChild: true
            };
        }

        // Check if first is a parent of the second
        if (start_time < second_start_time && end_time > second_end_time) {
            return {
                isParent: true
            };
        }

        if (start_time < second_start_time && end_time == second_end_time) {
            return {
                isParent: true
            };
        }

        if (start_time == second_start_time && end_time > second_end_time) {
            return {
                isParent: true
            };
        }

        return {
            isChild: false
        };
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
        if (hours == 24) {
            hours = 0;
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

    /**
     *
     * @param time Time in format HH:MM
     * @returns {number} float in range [0, 24]
     */
    const convertTimeToFloat = (time: string) => {
        let [hours, minutes] = time.split(":");
        return parseInt(hours) + parseInt(minutes) / 60;
    }

    /**
     * Updates the canvas width/height and the clock radius/center
     * based on current window size
     */
    const resizeCanvas = () => {
        if (canvasRef.current) {
            canvasRef.current.height = Math.min(1000, window.innerHeight - 20);
            canvasRef.current.width = Math.min(canvasRef.current.height, window.innerWidth - 20);
            let rad = Math.min(canvasRef.current.width, canvasRef.current.height) / 2 - minClockRadius;
            // Minimum clock radius
            if (rad < minClockRadius) rad = minClockRadius;
            // Center the clock
            let center = { x: canvasRef.current.width / 2, y: canvasRef.current.height / 2 };
            // Don't let clock go off left or top of screen
            if (center.x < minClockRadius) center.x = minClockRadius;
            if (center.y < minClockRadius) center.y = minClockRadius;
            radiusRef.current = rad;
            centerRef.current = center;
        }
    }

    /**
     * Draws the clock and all time blocks on the canvas
     * Handles hover effects for time blocks
     * @TODO Fix editable wedge being considered child of a wedge if both points are inside the wedge
     * ^ This may not need fixing if we don't allow siblings to overlap
     * @TODO Fix depth of editable wedge being 1 too deep
     * @TODO Fix isPointInWedge not working if endPoint is on the 0/2PI boundary
     */
    const drawLoop = () => {
        const canvas = canvasRef.current;
        if (canvas && radiusRef.current > 0) {
            const ctx = canvas?.getContext("2d");
            if (ctx == null) return;

            // Reset cursor style
            canvas.style.cursor = "default";

            // Clear the canvas
            ctx.reset();

            // Draw the clock
            drawClock(ctx, centerRef.current, radiusRef.current);

            // Draw the time blocks
            wedgesRef.current = drawWedges(ctx, centerRef.current, radiusRef.current, props.schedule.time_blocks);

            // Draw the temporary wedge if editing
            if (editModeRef.current) {
                let pointOnCircle = getPointOnCircle({ x: mousePosRef.current.x, y: mousePosRef.current.y }, radiusRef.current, centerRef.current, snapToRef.current);
                endPointRef.current = pointOnCircle;
                let times = getTimesFromPoints(startPointRef.current, pointOnCircle)
                // setEditStartTime(times.string_start_time)
                setEditEndTime(times.string_end_time)
                if (times.string_start_time !== times.string_end_time) {
                    let angles = getAnglesFromPoints(centerRef.current, startPointRef.current, pointOnCircle);
                    let depth = 0;

                    if (editParentRef.current) {
                        if (isPointInWedge(centerRef.current, 0, radiusRef.current, editParentRef.current.start_angle, editParentRef.current.end_angle, pointOnCircle)) {
                            depth = editParentRef.current.depth + 1;
                        }
                    }

                    let wedge: Wedge = {
                        start_angle: angles.start_angle,
                        end_angle: angles.end_angle,
                        clockwise: angles.clockwise,
                        color: editColorRef.current,
                        category: categoryRef.current,
                        timeblock_id: -1,
                        depth: depth,
                    }

                    drawWedge(ctx, centerRef.current, radiusRef.current, wedge);
                    // draw arc between start and end times
                    ctx.strokeStyle = "#fff";
                    ctx.arc(centerRef.current.x, centerRef.current.y, radiusRef.current + 80, wedge.start_angle, wedge.end_angle, !wedge.clockwise);
                    ctx.stroke();
                }
            } else if (showFormRef.current) {
                let angles = getAnglesFromPoints(centerRef.current, startPointRef.current, endPointRef.current);
                let depth = 0;

                if (editParentRef.current) {
                    depth = editParentRef.current.depth + 1;
                }

                let wedge: Wedge = {
                    start_angle: angles.start_angle,
                    end_angle: angles.end_angle,
                    clockwise: angles.clockwise,
                    color: editColorRef.current,
                    category: categoryRef.current,
                    timeblock_id: -1,
                    depth: depth
                }

                drawWedge(ctx, centerRef.current, radiusRef.current, wedge);
            } else if (radiusRef.current) {
                // Hover effect for wedges
                let found = false;
                for (let wedge of wedgesRef.current) {
                    if (isPointInWedge(centerRef.current, 0, radiusRef.current, wedge.start_angle, wedge.end_angle, { x: mousePosRef.current.x, y: mousePosRef.current.y })) {
                        // Highlight the wedge
                        found = true;
                        canvas.style.cursor = "pointer";

                        // Create a color that is slightly darker than the original
                        let newColor = shiftColorValue(wedge.color, 30);

                        drawWedge(ctx, centerRef.current, radiusRef.current + 20, wedge, `drop-shadow(0px 0px 10px ${"#2f3e54"})`, newColor);

                        let hoveredTimeBlock: TimeBlock | null = getTimeBlock(wedge.timeblock_id, props.schedule.time_blocks);

                        setSelectedTimeBlock(hoveredTimeBlock);
                    } else {
                        // Return wedge to normal
                        ctx.fillStyle = wedge.color;
                        drawWedge(ctx, centerRef.current, radiusRef.current, wedge);
                    }
                }
                if (!found) {
                    setSelectedTimeBlock(null);
                }
            }

        }

        requestAnimationFrame(drawLoop);
    }

    const getTimeBlock = (id: number, timeblocks: TimeBlock[]): TimeBlock | null => {
        for (let timeblock of timeblocks) {
            if (timeblock.id == id) {
                return timeblock;
            }
            let childBlock = getTimeBlock(id, timeblock.children);
            if (childBlock) {
                return childBlock;
            }
        }
        return null;
    }

    /**
     *
     * @param ctx The canvas context
     * @param center The (x, y) coordinates for the center of the clock
     * @param radius The radius of the clock
     * @TODO adjust hover radiuses depending on canvas width/height
     */
    const drawClock = (ctx: CanvasRenderingContext2D | null, center: Point, radius: number) => {
        if (canvasRef.current && ctx != null) {
            // Add clock outline
            ctx.strokeStyle = "white";
            ctx.filter = "opacity(0.3)";
            ctx.beginPath();
            ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.filter = "none";

            // Number of intervals in a day
            let num_increments = 1440 / snapToRef.current;
            // Number of intervals in an hour
            let intervals_per_hour = 60 / snapToRef.current;

            // Draw clock ticks
            for (let i = 0; i < num_increments; i++) {
                // Get the time for this tick
                let hour = Math.round(i / intervals_per_hour);
                let minute = Math.round(i % intervals_per_hour * snapToRef.current);
                let string_minute = minute.toString();
                if (minute < 10) {
                    string_minute = `0${minute}`;
                }
                let time = `${Math.floor(hour)}:${string_minute}`;

                // Get angle for this time
                let angle = map(0, num_increments, 0, Math.PI * 2, i) - Math.PI / 2;
                // Get point on circle for this time
                let pointOnCircle = getPointFromAngle(center, radius, angle);
                // Get point for HH:MM text, which is just a little further out
                let point = getPointFromAngle(center, radius + 40, angle);

                // Get point on circle corresponding to mouse position
                let mousePointOnCircle = getPointOnCircle(mousePosRef.current, radiusRef.current, centerRef.current, snapToRef.current);

                if (isPointInCircle(pointOnCircle, mousePointOnCircle, 0, 1)) {
                    // The exact tick we're hovering over
                    point = getPointFromAngle(center, radius + 40, angle);
                    ctx.strokeStyle = "#fff";
                    ctx.moveTo(pointOnCircle.x, pointOnCircle.y);
                    ctx.lineTo(point.x, point.y);
                    ctx.stroke();
                } else if (isPointInCircle(pointOnCircle, mousePointOnCircle, 0, 50)) {
                    // Nearby ticks

                    if (i % intervals_per_hour == 0) {
                        // Add the hour numbers
                        ctx.font = "20px Arial";
                        ctx.fillStyle = "#fff";
                        ctx.textAlign = "center";
                        ctx.textBaseline = "middle";
                        ctx.fillText(`${hour}`, point.x, point.y);

                        // Draw hour tick a little bigger
                        point = getPointFromAngle(center, radius + 20, angle);
                        ctx.strokeStyle = "#fff";
                        ctx.moveTo(pointOnCircle.x, pointOnCircle.y);
                        ctx.lineTo(point.x, point.y);
                        ctx.stroke();
                    } else if (intervals_per_hour <= 2) {
                        // Add the time in smaller font
                        ctx.font = "12px Arial";
                        ctx.fillStyle = "#fff";
                        ctx.textAlign = "center";
                        ctx.textBaseline = "middle";
                        ctx.fillText(time, point.x, point.y);
                    }

                    // Draw the minute ticks
                    point = getPointFromAngle(center, radius + 10, angle);
                    ctx.strokeStyle = "#fff";
                    ctx.moveTo(pointOnCircle.x, pointOnCircle.y);
                    ctx.lineTo(point.x, point.y);
                    ctx.stroke();
                } else if (isPointInCircle(pointOnCircle, mousePointOnCircle, 0, 150)) {
                    // Ticks a little further out, same deal as before but a shade darker

                    if (i % intervals_per_hour == 0) {
                        ctx.font = "20px Arial";
                        ctx.fillStyle = "#bbb";
                        ctx.textAlign = "center";
                        ctx.textBaseline = "middle";
                        ctx.fillText(`${hour}`, point.x, point.y);

                        point = getPointFromAngle(center, radius + 20, angle);
                        ctx.strokeStyle = "#fff";
                        ctx.moveTo(pointOnCircle.x, pointOnCircle.y);
                        ctx.lineTo(point.x, point.y);
                        continue;
                    } else if (intervals_per_hour <= 2) {
                        ctx.font = "12px Arial";
                        ctx.fillStyle = "#aaa";
                        ctx.textAlign = "center";
                        ctx.textBaseline = "middle";
                        ctx.fillText(time, point.x, point.y);
                    }

                    point = getPointFromAngle(center, radius + 10, angle);
                    ctx.strokeStyle = "#ddd";
                    ctx.moveTo(pointOnCircle.x, pointOnCircle.y);
                    ctx.lineTo(point.x, point.y);
                    ctx.stroke();

                } else {
                    // All other ticks
                    if (i % intervals_per_hour == 0) {
                        // Add the hour numbers
                        ctx.font = "20px Arial";
                        ctx.fillStyle = "#777";
                        ctx.textAlign = "center";
                        ctx.textBaseline = "middle";
                        ctx.fillText(`${i / intervals_per_hour}`, point.x, point.y);
                    }

                    point = getPointFromAngle(center, radius + 10, angle);
                    ctx.strokeStyle = "#777";
                    ctx.moveTo(pointOnCircle.x, pointOnCircle.y);
                    ctx.lineTo(point.x, point.y);
                    ctx.stroke();
                }
            }
        }
    }

    /**
     *
     * @param ctx Canvas context
     * @param center Center of circle
     * @param radius Radius of circle
     * @param timeblocks Array of TimeBlocks to draw
     * @param depth The depth for which the timeblocks should be drawn (AKA the radius for the wedges)
     */
    const drawWedges = (ctx: CanvasRenderingContext2D | null, center: Point, radius: number, timeblocks: TimeBlock[], depth: number = 0): Wedge[] => {
        let wedges: Wedge[] = [];
        for (let timeBlock of timeblocks) {
            let start_angle = getAngleFromTime(timeBlock.start_time);
            let end_angle = getAngleFromTime(timeBlock.end_time);

            // Add time block info to wedges
            let wedge: Wedge = {
                start_angle,
                end_angle,
                clockwise: true,
                color: timeBlock.color,
                category: timeBlock.category,
                timeblock_id: timeBlock.id,
                depth
            }
            wedges.push(wedge)

            // Draw it
            if (ctx != null) {
                drawWedge(ctx, center, radius, wedge, `opacity(${0.5 + depth * 0.1})`);
            }

            let child_wedges = drawWedges(ctx, center, radius, timeBlock.children, depth + 1);

            for (let child_wedge of child_wedges) {
                wedges.push(child_wedge);
            }
        }

        return wedges;
    }

    /**
     * Draws a given wedge in a circle with a certain radius
     * @param ctx Canvas context to draw on
     * @param center Center of circle
     * @param radius Radius of the circle
     * @param wedge Wedge to draw
     */
    const drawWedge = (ctx: CanvasRenderingContext2D, center: Point, radius: number, wedge: Wedge, filter?: string, newColor?: string, stroke?: string) => {
        ctx.fillStyle = newColor || wedge.color;
        ctx.lineCap = "round";
        ctx.filter = "opacity(0.5)";
        if (filter) {
            ctx.filter += filter;
        }
        ctx.beginPath();
        ctx.moveTo(center.x, center.y);
        let newRadius = radius * (1 - wedge.depth * (1 / treeHeightRef.current));
        ctx.arc(center.x, center.y, newRadius, wedge.start_angle, wedge.end_angle, !wedge.clockwise);
        ctx.closePath();
        ctx.fill();
        if (stroke) {
            ctx.strokeStyle = stroke;
            ctx.stroke();
        }
        // If the wedge is large enough, write the category
        if (Math.abs(wedge.end_angle - wedge.start_angle) >= Math.PI / 8) {
            // write category text
            let angle = (wedge.start_angle + wedge.end_angle) / 2;
            // If the wedge crosses the 0/2PI boundary
            if (wedge.start_angle > wedge.end_angle && wedge.clockwise) {
                angle += Math.PI;
            }
            let point = getPointFromAngle(center, newRadius - 50, angle);
            // draw rect behind text
            // ctx.fillStyle = "black";
            // ctx.roundRect(point.x - 25, point.y - 10, 50, 20, 5);
            ctx.font = " bold 15px Arial";
            let fontColor = "#222";
            ctx.fillStyle = fontColor;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            // use text ellipsis if it's too long
            let text = wedge.category.length > 10 ? wedge.category.substring(0, 10) + "..." : wedge.category;
            ctx.fillText(text, point.x, point.y);
        }
    }

    /******** CREATE WEDGE FORM HANDLERS ********/

    // don't see the point of cross-updating
    const onChangeStartTimeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        // let roundedTime = roundTime(e.target.value, 0, 24, snapToRef.current);
        // setEditStartTime(roundedTime);

    }

    // don't see the point of cross-updating
    const onChangeEndTimeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        // let roundedTime = roundTime(e.target.value, 0, 24, snapToRef.current);
        // setEditEndTime(roundedTime);
    }

    const onChangeColor = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditColor(e.target.value);
    }

    const onChangeCategory = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCategory(e.target.value);
    }

    /**
     * Validate snap to input
     * @TODO Don't allow snap values that are not factors of 60
     * */
    const snapToHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        let snap = parseInt(e.target.value);
        if (snap < 10) {
            setSnapTo(10);
        } else if (snap > 30) {
            setSnapTo(30);
        } else if (60 % snap != 0) {
            setSnapTo(30);
        }
        setSnapTo(snap);
    }


    return (
        <section>
            <button ref={addButtonRef} id="start-add-button" className={styles.add_button} onClick={enterEditMode}>+</button>
            <button ref={stopButtonRef} id="stop-add-button" className={styles.stop_button} onClick={exitEditMode}></button>
            <input value={snapTo} onChange={snapToHandler} type="number" className={styles.snapToInput} />
            <div className={styles.clock_info}>
                <div className={styles.clock} ref={canvasParentRef}>
                    <canvas ref={canvasRef} id="canvas"></canvas>
                    <div className={styles.modal} ref={modalRef}>
                        <div className={styles.selected_time_block}>
                            {selectedTimeBlock ? <TimeBlockModal timeBlock={selectedTimeBlock}/> : null}
                        </div>
                        <div className={styles.create_form}>
                            {showForm ? <CreateTimeBlockPartialForm
                                endTime={editEndTime}
                                startTime={editStartTime}
                                color={editColor}
                                category={category}
                                changeColorHandler={onChangeColor}
                                changeCategoryHandler={onChangeCategory}
                                state={editState}
                                onSubmit={onSubmitCreateTimeBlock}
                                />
                                : null}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Clock;