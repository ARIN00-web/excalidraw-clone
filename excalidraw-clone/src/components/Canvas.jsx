import {Stage,Layer, Rect} from 'react-konva';
import useStore from '../store';
function Canvas(){
    const {shapes, tool, color,selectedShape,setSelectedShape,updateShapes} = useStore();
   
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
        updateShapes([...shapes, newRect]);
    };

    return(
        <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        style={{cursor: tool === "select" ? "default" : "crosshair"}}
        >
            <Layer>
                {shapes.map((shape) => (
                    <Rect
                        key={shape.id}
                        x={shape.x}
                        y={shape.y}
                        width={shape.width}
                        height={shape.height}
                        stroke={selectedShape === shape.id ? "blue" : "black"}

                        fill={shape.fill}
                        draggable={tool === "select"}
                        onDragEnd={(e) =>{
                            const updatedShapes = shapes.map((s) => 
                                s.id === shape.id
                                ?{...s, x: e.target.x(), y: e.target.y()}
                                :s
                               
                            );
                        
                        updateShapes(updatedShapes);
                                
                        }}
                             onClick = {(e)=> {
                                    if(tool === "select"){
                                        setSelectedShape(shape.id);
                                    }
                                }}
                    
                        //fill={shape.fill}
                    />
                ))}
            </Layer>
        </Stage>
    )
        
    
}

export default Canvas;