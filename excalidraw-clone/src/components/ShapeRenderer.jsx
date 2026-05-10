import React from 'react';
import { Rect, Ellipse, Line, Text, Arrow, Image as KonvaImage, Transformer } from 'react-konva';
import useStore from '../store';

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

function ShapeRenderer({ shape, isSelected, tool, updateShapes, shapes, setSelectedShape }) {
    const strokeColor = isSelected ? "#a48cfa" : shape.stroke;
    const isDraggable = tool === "select";

    const handleSelect = () => {
        if (tool === "select") {
            setSelectedShape(shape.id);
            useStore.getState().setPropertyPanelVisible(true);
        }
    };

    const deleteThisShape = () => {
        updateShapes(shapes.filter((s) => s.id !== shape.id));
    };

    const defaultProps = {
        key: shape.id,
        stroke: strokeColor,
        strokeWidth: shape.strokeWidth || 2,
        fill: shape.fill,
        draggable: isDraggable,
        onClick: () => {
            if (tool === "eraser") deleteThisShape();
            else handleSelect();
        },
        onMouseEnter: (e) => {
            // e.evt.buttons === 1 means the left mouse button is held down
            if (tool === "eraser" && e.evt.buttons === 1) {
                deleteThisShape();
            }
        },
        onDragEnd: (e) => {
            const updatedShapes = shapes.map((s) =>
                s.id === shape.id ? { ...s, x: e.target.x(), y: e.target.y() } : s
            );
            updateShapes(updatedShapes);
        }
    };

    if (shape.type === "rect") {
        return (
            <Rect
                {...defaultProps}
                x={shape.x}
                y={shape.y}
                width={shape.width}
                height={shape.height}
            />
        );
    } else if (shape.type === "circle") {
        return (
            <Ellipse
                {...defaultProps}
                x={shape.x + shape.width / 2}
                y={shape.y + shape.height / 2}
                radiusX={Math.abs(shape.width) / 2}
                radiusY={Math.abs(shape.height) / 2}
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
                {...defaultProps}
                x={shape.x}
                y={shape.y}
                points={[
                    shape.width / 2, 0,
                    shape.width, shape.height / 2,
                    shape.width / 2, shape.height,
                    0, shape.height / 2
                ]}
                closed={true}
            />
        );
    } else if (shape.type === "pen") {
        return (
            <Line
                {...defaultProps}
                x={shape.x}
                y={shape.y}
                points={shape.points}
                fill="transparent"
                tension={0.5}
                lineCap="round"
                lineJoin="round"
            />
        );
    } else if (shape.type === "text") {
        return (
            <Text
                {...defaultProps}
                x={shape.x}
                y={shape.y}
                text={shape.text}
                fontSize={24}
                strokeWidth={0} // Text doesn't usually have stroke in this app unless explicitly requested
            />
        );
    } else if (shape.type === "line") {
        return (
            <Line
                {...defaultProps}
                x={shape.x}
                y={shape.y}
                points={[0, 0, shape.width, shape.height]}
            />
        );
    } else if (shape.type === "arrow") {
        return (
            <Arrow
                {...defaultProps}
                x={shape.x}
                y={shape.y}
                points={[0, 0, shape.width, shape.height]}
                fill={strokeColor} // Overrides default fill specifically for arrowheads
            />
        );
    } else if (shape.type === "image") {
        return (
            <CustomImage
                shapeProps={shape}
                isSelected={isSelected}
                isDraggable={isDraggable}
                onSelect={defaultProps.onClick}
                onMouseEnter={defaultProps.onMouseEnter}
                onDragEnd={defaultProps.onDragEnd}
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
}

export default ShapeRenderer;
