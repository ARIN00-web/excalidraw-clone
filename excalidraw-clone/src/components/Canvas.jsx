import { Stage, Layer, Rect, Ellipse, Line ,Text} from 'react-konva';
import useStore from '../store';
import React, { useRef, useEffect } from 'react';
function Canvas() {
    const { shapes, tool, color,strokeWidth, canvasBackground, selectedShape, setSelectedShape, updateShapes ,setTool} = useStore();
    
    // We use a ref to track if the mouse is held down without causing useless re-renders
    const isDrawing = useRef(false);
    const stageRef = useRef(null);

    
    // This magically updates the CSS variable we defined in index.css!
    useEffect(() => {
    document.documentElement.style.setProperty('--canvas-bg', canvasBackground);
    }, [canvasBackground]);
       
        useEffect(() => {
        const handleExport = () => {
            // Konva magically converts the canvas to an image string!
            const uri = stageRef.current.toDataURL();
            
            // Create an invisible HTML link to force a download
            const link = document.createElement("a");
            link.download = "excalidraw-masterpiece.png";
            link.href = uri;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        window.addEventListener("export-canvas", handleExport);
        return () => window.removeEventListener("export-canvas", handleExport);
    }, []);




    const handleMouseDown = (e) => {
        // If we click while in select mode, we don't want to draw a shape!
        if (tool === "select" || tool === "eraser") return;

         // 👇 MOVED THIS LINE UP SO `pos` IS READY TO BE USED 👇
        const pos = e.target.getStage().getPointerPosition();
                if (tool === "text") {
            const textValue = prompt("What do you want to type?");
            if (textValue) {
                const newShape = {
                    id: Date.now().toString(),
                    type: "text",
                    x: pos.x,
                    y: pos.y,
                    text: textValue,
                    fill: color,
                };
                updateShapes([...shapes, newShape]);
            }
            // Switch back to select mode so you can immediately drag your new text!
            setTool("select");
            return;
        }

        isDrawing.current = true;
     

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
            ref={stageRef}


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

                    {/* Add this rectangle first to act as a solid background for image exports! */}
                <Rect
                    x={0}
                    y={0}
                    width={window.innerWidth}
                    height={window.innerHeight}
                    fill={canvasBackground}
                    listening={false} // Prevents us from accidentally selecting or interacting with it
                />

                
                    {shapes.map((shape) => {
                    const isSelected = selectedShape === shape.id;
                    const strokeColor = isSelected ? "#a48cfa" : shape.stroke;
                    const isDraggable = tool === "select";

                    const handleSelect = () => {
                        if (tool === "select") setSelectedShape(shape.id);
                    };
                                        const deleteThisShape = () => {
                        updateShapes(shapes.filter((s) => s.id !== shape.id));
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
                                                                onClick={() => {
                                    if (tool === "eraser") deleteThisShape();
                                    else handleSelect();
                                }}
                                onMouseEnter={(e) => {
                                    // e.evt.buttons === 1 means the left mouse button is held down
                                    if (tool === "eraser" && e.evt.buttons === 1) {
                                        deleteThisShape();
                                    }
                                }}

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
                                                                onClick={() => {
                                    if (tool === "eraser") deleteThisShape();
                                    else handleSelect();
                                }}
                                onMouseEnter={(e) => {
                                    // e.evt.buttons === 1 means the left mouse button is held down
                                    if (tool === "eraser" && e.evt.buttons === 1) {
                                        deleteThisShape();
                                    }
                                }}

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
                    } else if (shape.type === "rhombus") {
                        return (
                            <Line
                                key={shape.id}
                                x={shape.x}
                                y={shape.y}
                                // The 4 points of a diamond: [Top-X, Top-Y, Right-X, Right-Y, Bottom-X, Bottom-Y, Left-X, Left-Y]
                                points={[
                                    shape.width / 2, 0, // Top point
                                    shape.width, shape.height / 2, // Right point
                                    shape.width / 2, shape.height, // Bottom point
                                    0, shape.height / 2 // Left point
                                ]}
                                closed={true} // Connect the left point back to the top point!
                                stroke={strokeColor}
                                strokeWidth={shape.strokeWidth || 2}
                                fill={shape.fill}
                                draggable={isDraggable}
                                onClick={() => {
                                    if (tool === "eraser") deleteThisShape();
                                    else handleSelect();
                                }}
                                onMouseEnter={(e) => {
                                    if (tool === "eraser" && e.evt.buttons === 1) deleteThisShape();
                                }}
                                onDragEnd={(e) => {
                                    const updatedShapes = shapes.map((s) =>
                                        s.id === shape.id ? { ...s, x: e.target.x(), y: e.target.y() } : s
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
                                                                onClick={() => {
                                    if (tool === "eraser") deleteThisShape();
                                    else handleSelect();
                                }}
                                onMouseEnter={(e) => {
                                    // e.evt.buttons === 1 means the left mouse button is held down
                                    if (tool === "eraser" && e.evt.buttons === 1) {
                                        deleteThisShape();
                                    }
                                }}

                                onDragEnd={(e) => {
                                    const updatedShapes = shapes.map((s) =>
                                        s.id === shape.id ? { ...s, x: e.target.x(), y: e.target.y() } : s
                                    );
                                    updateShapes(updatedShapes);
                                }}
                            />
                        );
                        
                    } 
                    else if (shape.type === "text") {
                        return (
                            <Text
                                key={shape.id}
                                x={shape.x}
                                y={shape.y}
                                text={shape.text}
                                fontSize={24} // Let's give it a nice default size
                                fill={shape.fill}
                                draggable={isDraggable}
                                onClick={() => {
                                    if (tool === "eraser") deleteThisShape();
                                    else handleSelect();
                                }}
                                onMouseEnter={(e) => {
                                    if (tool === "eraser" && e.evt.buttons === 1) deleteThisShape();
                                }}
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
