import {Stage,Layer, Rect} from 'react-konva';

function Canvas({shapes, setShapes, tool, color}){

    const handleMouseDown = (e) => {
        if(tool != "rect") return;

        const pos = e.target.getStage().getPointerPosition();
        const newRect = {
            x: pos.x,
            y: pos.y,
            width: 100,
            height: 100,
            fill: color,
            id: Date.now().toString(),
        };
        setShapes([...shapes, newRect]);
    };

    return(
        <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        >
            <Layer>
                {shapes.map((shape) => (
                    <Rect
                        key={shape.id}
                        x={shape.x}
                        y={shape.y}
                        width={shape.width}
                        height={shape.height}
                        stroke="black"
                        fill={shape.fill}
                        draggable={tool === "select"}
                        onDragEnd={(e) =>{
                            const updatedShapes = shapes.map((s) => 
                                s.id === shape.id
                                ?{...s, x: e.target.x(), y: e.target.y()}
                                :s
                            );
                        setShapes(updatedShapes);
                                
                        }}
                    
                        //fill={shape.fill}
                    />
                ))}
            </Layer>
        </Stage>
    )
        
    
}

export default Canvas;