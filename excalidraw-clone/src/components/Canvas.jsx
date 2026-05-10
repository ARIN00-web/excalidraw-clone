import { Stage, Layer, Rect } from 'react-konva';
import useStore from '../store';
import React, { useRef, useEffect } from 'react';
import ShapeRenderer from './ShapeRenderer';
import MultiplayerCursors from './MultiplayerCursors';

function Canvas() {
    const { shapes, tool, color,strokeWidth, canvasBackground, selectedShape, setSelectedShape, updateShapes ,setTool,cursors, stagePos, setStagePos, fillStyle, setPropertyPanelVisible} = useStore();
    
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
        // If clicking on the empty canvas, deselect shape and close panel
        if (e.target === e.target.getStage()) {
            setPropertyPanelVisible(false);
            setSelectedShape(null);
        } else if (tool !== "select" && tool !== "hand" && tool !== "eraser") {
            // If starting to draw a new shape, hide property panel
            setPropertyPanelVisible(false);
        }

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
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
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
                {/* Render other users' cursors! */}
                <MultiplayerCursors cursors={cursors} />

                {/* Render all the shapes beautifully! */}
                {shapes.map((shape) => (
                    <ShapeRenderer
                        key={shape.id}
                        shape={shape}
                        isSelected={selectedShape === shape.id}
                        tool={tool}
                        updateShapes={updateShapes}
                        shapes={shapes}
                        setSelectedShape={setSelectedShape}
                    />
                ))}

            </Layer>
        </Stage>
    );
}

export default Canvas;
