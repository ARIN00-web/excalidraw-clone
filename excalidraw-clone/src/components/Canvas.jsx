import { Stage, Layer, Rect, Ellipse, Line ,Text,Arrow , Image as KonvaImage ,Transformer, Group, Path} from 'react-konva';
import useStore from '../store';
import React, { useRef, useEffect } from 'react';

// Upgraded component with built-in resizing!
const CustomImage = ({ shapeProps, isSelected, isDraggable, onSelect, onMouseEnter, onDragEnd, onTransformEnd }) => {
    const [image, setImage] = React.useState(null);
    const imageRef = React.useRef(null);
    const trRef = React.useRef(null);

    React.useEffect(() => {
        const img = new window.Image();
        img.src = shapeProps.src;
        img.onload = () => {
            setImage(img);
        };
    }, [shapeProps.src]);

    // This magically attaches the resize handles when you select the image!
    React.useEffect(() => {
        if (isSelected && trRef.current && imageRef.current) {
            trRef.current.nodes([imageRef.current]);
            trRef.current.getLayer().batchDraw();
        }
    }, [isSelected]);

    return (
        <React.Fragment>
            <KonvaImage
                ref={imageRef}
                x={shapeProps.x}
                y={shapeProps.y}
                scaleX={shapeProps.scaleX || 1} // Apply the scale!
                scaleY={shapeProps.scaleY || 1}
                rotation={shapeProps.rotation || 0} // You can even rotate it now!
                image={image}
                draggable={isDraggable}
                onClick={onSelect}
                onMouseEnter={onMouseEnter}
                onDragEnd={onDragEnd}
                onTransformEnd={onTransformEnd} // Save the new size when you let go
            />
            {isSelected && (
                <Transformer
                    ref={trRef}
                    boundBoxFunc={(oldBox, newBox) => {
                        // Don't let them shrink it until it disappears
                        if (newBox.width < 10 || newBox.height < 10) return oldBox;
                        return newBox;
                    }}
                />
            )}
        </React.Fragment>
    );
};



function Canvas() {
    const { shapes, tool, color,strokeWidth, canvasBackground, selectedShape, setSelectedShape, updateShapes ,setTool,cursors, stagePos, setStagePos, fillStyle} = useStore();
    
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

          useEffect(() => {
        const handleImageUpload = (e) => {
            const base64Src = e.detail;
            
            // We use get() behind the scenes to make sure we don't grab stale data!
            const currentStore = useStore.getState();
            
            const newShape = {
                id: Date.now().toString(),
                type: "image",
                x: window.innerWidth / 2 - 100, // Drop it right in the middle!
                y: window.innerHeight / 2 - 100,
                src: base64Src,
            };
            
            currentStore.updateShapes([...currentStore.shapes, newShape]);
            currentStore.setTool("select"); // Automatically switch to the select tool so they can drag it!
        };

        window.addEventListener("upload-image", handleImageUpload);
        return () => window.removeEventListener("upload-image", handleImageUpload);
    }, []);



    const handleMouseDown = (e) => {
        // If we click while in select mode, we don't want to draw a shape!
        if (tool === "select" || tool === "eraser" || tool === "hand") return;

         // 👇 MOVED THIS LINE UP SO `pos` IS READY TO BE USED 👇
        const stage = e.target.getStage();
        const pointerPosition = stage.getPointerPosition();
        const pos = {
            x: (pointerPosition.x - stage.x()) / stage.scaleX(),
            y: (pointerPosition.y - stage.y()) / stage.scaleY()
        };
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
            fill: tool === "pen" || tool === "line" || tool === "arrow" ? "transparent" : (fillStyle === "solid" ? color : fillStyle === "translucent" ? color + "33" : "transparent"),
            stroke: color, // We save the color as the stroke too!
         strokeWidth: strokeWidth, // Save the thickness!
        };

        updateShapes([...shapes, newShape]);
    };

    const handleMouseMove = (e) => {
        const stage = e.target.getStage();
        const pointerPosition = stage.getPointerPosition();
        const point = {
            x: (pointerPosition.x - stage.x()) / stage.scaleX(),
            y: (pointerPosition.y - stage.y()) / stage.scaleY()
        };

        // 👇 BROADCAST OUR MOUSE POSITION TO THE WORLD! 👇
        useStore.getState().updateCursorPosition(point.x, point.y);


        // If we aren't holding down the mouse, do nothing
        if (!isDrawing.current || tool === "select") return;

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
            x={stagePos?.x || 0}
            y={stagePos?.y || 0}
            draggable={tool === "hand"}
            onDragEnd={(e) => {
                if (e.target === e.target.getStage()) {
                    setStagePos({ x: e.target.x(), y: e.target.y() });
                }
            }}
            width={window.innerWidth}
            height={window.innerHeight}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            // Cut it off if they drag out of bounds
            onMouseLeave={handleMouseUp}
            style={{ cursor: tool === "hand" ? "grab" : tool === "select" ? "default" : "crosshair" }}
        >
            <Layer>
                    
                    {/* Add this rectangle first to act as a solid background for image exports! */}
                <Rect
                    x={-50000}
                    y={-50000}
                    width={100000}
                    height={100000}
                    fill={canvasBackground}
                    listening={false} // Prevents us from accidentally selecting or interacting with it
                />
                {/* Render other users' cursors! */}
                {Object.keys(cursors).map(clientId => {
                    const cursor = cursors[clientId];
                    if (!cursor || !cursor.cursor) return null;
                    
                    return (
                        <Group key={clientId} x={cursor.cursor.x} y={cursor.cursor.y}>
                            {/* A cute little circular mouse pointer */}
                            <Ellipse
                                radiusX={8}
                                radiusY={8}
                                fill={cursor.color}
                                stroke="white"
                                strokeWidth={2}
                                shadowColor="black"
                                shadowBlur={4}
                                shadowOpacity={0.3}
                            />
                            {/* The user's name badge */}
                            <Rect
                                x={10}
                                y={10}
                                width={cursor.name.length * 8 + 10}
                                height={20}
                                fill={cursor.color}
                                cornerRadius={4}
                            />
                            <Text
                                x={15}
                                y={14}
                                text={cursor.name}
                                fill="white"
                                fontSize={12}
                                fontStyle="bold"
                            />
                        </Group>
                    );
                })}

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
                                            } else if (shape.type === "line") {
                        return (
                            <Line
                                key={shape.id}
                                x={shape.x}
                                y={shape.y}
                                // A straight line is just two points: Start (0,0) and End (width, height)
                                points={[0, 0, shape.width, shape.height]}
                                stroke={strokeColor}
                                strokeWidth={shape.strokeWidth || 2}
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
                    } else if (shape.type === "arrow") {
                        return (
                            <Arrow
                                key={shape.id}
                                x={shape.x}
                                y={shape.y}
                                // An arrow is exactly the same as a line, Konva just draws the triangle at the end for us!
                                points={[0, 0, shape.width, shape.height]}
                                stroke={strokeColor}
                                fill={strokeColor} // The arrowhead needs a fill color!
                                strokeWidth={shape.strokeWidth || 2}
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
                    } else if (shape.type === "image") {
                        return (
                            <CustomImage
                                key={shape.id}
                                shapeProps={shape}
                                isSelected={selectedShape === shape.id}
                                isDraggable={isDraggable}
                                onSelect={() => {
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
                                // 👇 NEW PROP TO SAVE THE RESIZING 👇
                                onTransformEnd={(e) => {
                                    const node = e.target;
                                    const updatedShapes = shapes.map((s) =>
                                        s.id === shape.id ? { 
                                            ...s, 
                                            x: node.x(), 
                                            y: node.y(),
                                            scaleX: node.scaleX(),
                                            scaleY: node.scaleY(),
                                            rotation: node.rotation()
                                        } : s
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
