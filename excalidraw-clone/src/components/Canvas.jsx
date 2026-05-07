import { Stage, Layer, Rect, Ellipse, Line } from 'react-konva';
import useStore from '../store';
import React, { useRef, useEffect } from 'react';
function Canvas() {
    const { shapes, tool, color,strokeWidth, canvasBackground, selectedShape, setSelectedShape, updateShapes } = useStore();
    
    // We use a ref to track if the mouse is held down without causing useless re-renders
    const isDrawing = useRef(false);
    
    // This magically updates the CSS variable we defined in index.css!
    useEffect(() => {
    document.documentElement.style.setProperty('--canvas-bg', canvasBackground);
    }, [canvasBackground]);


    const handleMouseDown = (e) => {
        // If we click while in select mode, we don't want to draw a shape!
        if (tool === "select") return;

        isDrawing.current = true;
        const pos = e.target.getStage().getPointerPosition();

        // Inject the invisible "seed" shape
        const newShape = {
            id: Date.now().toString(),
            type: tool, // Notice this! We now dynamically save whether it is a "rect" or "circle"
            x: tool === "pen" ? 0 : pos.x,
            y: tool === "pen" ? 0 : pos.y,
            width: 0,   
            height: 0,
            points: [pos.x, pos.y], // used for pen tool
            fill: tool === "pen" ? "transparent" : color,
            stroke: color, // We save the color as the stroke too!
         strokeWidth: strokeWidth, // Save the thickness!
        };

        updateShapes([...shapes, newShape]);
    };

    const handleMouseMove = (e) => {
        // If we aren't holding down the mouse, do nothing
        if (!isDrawing.current || tool === "select") return;

        const stage = e.target.getStage();
        const point = stage.getPointerPosition();

        // Copy the last shape we just injected
        let lastShape = { ...shapes[shapes.length - 1] };

        if (lastShape.type === "pen") {
            // Append the new point to the points array
            lastShape.points = lastShape.points.concat([point.x, point.y]);
        } else {
            // 🧠 The Core Math: Current Mouse Position minus the starting position = the Size!
            lastShape.width = point.x - lastShape.x;
            lastShape.height = point.y - lastShape.y;
        }
        // Immutably swap out the old last shape with the new live one
        const updatedShapes = shapes.slice(0, shapes.length - 1).concat(lastShape);
        
        updateShapes(updatedShapes);
    };

    const handleMouseUp = () => {
        isDrawing.current = false;
    };

    return (
        <Stage
            width={window.innerWidth}
            height={window.innerHeight}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            // Cut it off if they drag out of bounds
            onMouseLeave={handleMouseUp}
            style={{ cursor: tool === "select" ? "default" : "crosshair" }}
        >
            <Layer>
                                {shapes.map((shape) => {
                    const isSelected = selectedShape === shape.id;
                    const strokeColor = isSelected ? "#a48cfa" : shape.stroke;
                    const isDraggable = tool === "select";

                    const handleSelect = () => {
                        if (tool === "select") setSelectedShape(shape.id);
                    };

                    if (shape.type === "rect") {
                        return (
                            <Rect
                                key={shape.id}
                                x={shape.x}
                                y={shape.y}
                                width={shape.width}
                                height={shape.height}
                                stroke={strokeColor}
                                strokeWidth={shape.strokeWidth || 2}
                                fill={shape.fill}
                                draggable={isDraggable}
                                onClick={handleSelect}
                                onDragEnd={(e) => {
                                    const updatedShapes = shapes.map((s) =>
                                        s.id === shape.id ? { ...s, x: e.target.x(), y: e.target.y() } : s
                                    );
                                    updateShapes(updatedShapes);
                                }}
                            />
                        );
                    } else if (shape.type === "circle") {
                        return (
                            <Ellipse
                                key={shape.id}
                                x={shape.x + shape.width / 2}
                                y={shape.y + shape.height / 2}
                                radiusX={Math.abs(shape.width) / 2}
                                radiusY={Math.abs(shape.height) / 2}
                                stroke={strokeColor}
                                strokeWidth={shape.strokeWidth || 2}
                                fill={shape.fill}
                                draggable={isDraggable}
                                onClick={handleSelect}
                                onDragEnd={(e) => {
                                    const updatedShapes = shapes.map((s) =>
                                        s.id === shape.id 
                                        ? { ...s, x: e.target.x() - s.width / 2, y: e.target.y() - s.height / 2 } 
                                        : s
                                    );
                                    updateShapes(updatedShapes);
                                }}
                            />
                        );
                    } else if (shape.type === "pen") {
                        return (
                            <Line
                                key={shape.id}
                                x={shape.x}
                                y={shape.y}
                                points={shape.points}
                                stroke={strokeColor}
                                strokeWidth={shape.strokeWidth || 2}
                                fill="transparent"
                                tension={0.5} // Gives the line a smooth, natural curve!
                                lineCap="round"
                                lineJoin="round"
                                draggable={isDraggable}
                                onClick={handleSelect}
                                onDragEnd={(e) => {
                                    const updatedShapes = shapes.map((s) =>
                                        s.id === shape.id ? { ...s, x: e.target.x(), y: e.target.y() } : s
                                    );
                                    updateShapes(updatedShapes);
                                }}
                            />
                        );
                    }
                    return null;
                })}

            </Layer>
        </Stage>
    );
}

export default Canvas;
