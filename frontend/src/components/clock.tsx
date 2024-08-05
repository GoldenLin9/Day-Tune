'use client';

import React, { useEffect, useRef } from 'react';
import { Schedule, TimeBlock } from '@/types';
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createTimeBlock, deleteTimeBlock, updateTimeBlock } from '@/app/actions/time-block';
import { start } from 'repl';

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
    const center = { x: 500, y: 500 };
    const radius = 500;

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

    // Draw the clock and time blocks
    useEffect(() => {
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
    const getPointOnCircle = (mousePos: Point, radius: number) : Point => {
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

        return pointOnCircle;
    }

    /**
     *
     * @param start The (x,y) coordinates on the circle of the starting point
     * @param endPoint The (x,y) coordinates on the circle of the ending point
     * @returns {Wedge}
     */
    const getWedgeFromPoints = (start: Point, endPoint: Point) : Wedge => {
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
            // Convert negative angles to positive (0 to 2 PI)
            if (endPoint.x >= center.x && endPoint.y >= center.y) {
                // Quadrant 4
                end_angle += Math.PI * 2;
            }
            if (endPoint.x <= center.x && endPoint.y >= center.y) {
                // Quadrant 3
                end_angle += Math.PI * 2;
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

                let pointOnCircle = getPointOnCircle({x: e.clientX, y: e.clientY}, radius);

                let wedge = getWedgeFromPoints(startPointRef.current, pointOnCircle);

                // draw wedge
                if (ctx != null) {
                    ctx.reset();
                    drawLoop();
                    ctx.fillStyle = "#1095D9";
                    ctx.beginPath();
                    ctx.moveTo(center.x, center.y);
                    ctx.arc(center.x, center.y, radius, wedge.start_angle, wedge.end_angle, !wedge.clockwise);
                    ctx.closePath();
                    ctx.fill();
                }

                // move stop button
                if (stopButtonRef.current) {
                    stopButtonRef.current.style.display = "block";
                    const pointOutsideClock = getPointOnCircle({x: e.clientX, y: e.clientY}, radius + 50);

                    // adjust button position based on width / height of button
                    stopButtonRef.current.style.left = `${pointOutsideClock.x + canvas.offsetLeft - 32}px`;
                    stopButtonRef.current.style.top = `${pointOutsideClock.y + canvas.offsetTop - 32}px`;
                }
            }
        } else if (addButtonRef.current && canvasRef.current) {
            const pointOutsideClock = getPointOnCircle({x: e.clientX, y: e.clientY}, radius + 50);

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

    const handleDelete = (timeBlock: TimeBlock) => {
        deleteTimeBlock(timeBlock.id).then((deleteTimeBlock) => {
            console.log(deleteTimeBlock);
        })
    }

    const enterEditMode = (e: any) => {
        // Start a new time block
        let startPoint = getPointOnCircle({x: e.clientX, y: e.clientY}, radius);

        setStartPoint(startPoint);

        setEditMode(true);
    }


    const exitEditMode = (e: any) => {
        // Finish the new time block
        let endPoint = getPointOnCircle({x: e.clientX, y: e.clientY}, radius);

        let wedge = getWedgeFromPoints(startPointRef.current, endPoint);

        let start_time = map(0, Math.PI * 2, 0, 24, wedge.start_angle);
        let end_time = map(0, Math.PI * 2.0, 0, 24, wedge.end_angle);

        createTimeBlock(start_time, end_time, "Default")
            .then(() => {})
            .catch(err => {
                console.log(err)
            })

        setEditMode(false);

        if (stopButtonRef.current) stopButtonRef.current.style.display = "none";
    }

    /**
     * Draws the clock and all time blocks on the canvas
     * @TODO Make wedges clickable to display more info
     * @TODO Show hours of the clock around the edge
     */
    const drawLoop = () => {
        const canvas = canvasRef.current;

        if (canvas?.getContext) {
            const ctx = canvas.getContext("2d");

            // Add clock outline
            if (ctx != null) {
                ctx.strokeStyle = "black";
                ctx.beginPath();
                ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
                ctx.stroke();
            }

            // Add all time blocks to the clock
            for (let timeBlock of props.schedule.time_blocks) {
                let start_time = timeBlock.start_time;
                let end_time = timeBlock.end_time;

                // Convert time to radians
                // Subtract by Math.PI / 2 to start at 12 o'clock
                let start_angle = map(0, 12, 0, Math.PI * 2, start_time) - Math.PI / 2;
                let end_angle = map(0, 12, 0, Math.PI * 2, end_time) - Math.PI / 2;

                if (ctx != null) {
                    ctx.fillStyle = timeBlock.color;
                    ctx.beginPath();
                    ctx.moveTo(center.x, center.y);
                    ctx.arc(center.x, center.y, radius, start_angle, end_angle, false);
                    ctx.closePath();
                    ctx.fill();
                }
            }
        }
    }

    return (
        <section>
            <section>
                {selectedTimeBlock && (
                    <div>
                        <p>Start time: {selectedTimeBlock.start_time}</p>
                        <p>End time: {selectedTimeBlock.end_time}</p>
                        <p>Category: {selectedTimeBlock.category}</p>
                        <button onClick={() => handleDelete(selectedTimeBlock)}>Delete Timeblock</button>
                    </div>
                )}
            </section>
            <button ref={addButtonRef} id="start-add-button" className="absolute bg-primary hover:bg-primary-button text-accent-text w-16 h-16 rounded-full" onClick={enterEditMode}>+</button>
            <button ref={stopButtonRef} id="stop-add-button" className="absolute bg-primary hover:bg-primary-button text-accent-text w-16 h-16 rounded-full hidden" onClick={exitEditMode}>S</button>
            <canvas ref={canvasRef} id="canvas" width="1000" height="1000"></canvas>
        </section>
    )
}

export default Clock;