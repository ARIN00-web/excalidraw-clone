import React from "react";
import useStore from "../store";
import './Toolbar.css';
import { MousePointer2, Square, Circle as CircleIcon, Pen, Undo2, Redo2,Eraser ,Type, Download,Diamond} from 'lucide-react';
function Toolbar() {
    const { tool, setTool, undo, redo } = useStore();
    return (
        <div className="toolbar">
            <button className={`tool-btn ${tool === "select" ? "active" : ""}`} onClick={() => setTool("select")} title="Select">
                <MousePointer2 size={20} />
            </button>
            <button className={`tool-btn ${tool === "pen" ? "active" : ""}`} onClick={() => setTool("pen")} title="Pen">
                <Pen size={20} />
            </button>
            <button className={`tool-btn ${tool === "eraser" ? "active" : ""}`} onClick={() => setTool("eraser")} title="Eraser">
                <Eraser size={20} />
            </button>
            <button className={`tool-btn ${tool === "rect" ? "active" : ""}`} onClick={() => setTool("rect")} title="Rectangle">
                <Square size={20} />
            </button>
            <button className={`tool-btn ${tool === "circle" ? "active" : ""}`} onClick={() => setTool("circle")} title="Circle">
                <CircleIcon size={20} />
            </button>
            <button className={`tool-btn ${tool === "rhombus" ? "active" : ""}`} onClick={() => setTool("rhombus")} title="Rhombus">
                <Diamond size={20} />
            </button>
            <button className={`tool-btn ${tool === "text" ? "active" : ""}`} onClick={() => setTool("text")} title="Text">
                <Type size={20} />
            </button>
            <div style={{ width: '1px', background: 'var(--ui-border)', margin: '0 4px' }} />
            <button className="tool-btn" onClick={undo} title="Undo">
                <Undo2 size={20} />
            </button>
            <button className="tool-btn" onClick={redo} title="Redo">
                <Redo2 size={20} />
            </button>
                        <div style={{ width: '1px', background: 'var(--ui-border)', margin: '0 4px' }} />
            <button className="tool-btn" onClick={() => window.dispatchEvent(new Event("export-canvas"))} title="Download Image">
                <Download size={20} />
            </button>

        </div>
    )
}
export default Toolbar;