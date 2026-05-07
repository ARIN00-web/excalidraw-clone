import React from "react";
import useStore from "../store";
import './Toolbar.css';
import { MousePointer2, Square, Circle as CircleIcon, Pen, Undo2, Redo2 } from 'lucide-react';
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
            <button className={`tool-btn ${tool === "rect" ? "active" : ""}`} onClick={() => setTool("rect")} title="Rectangle">
                <Square size={20} />
            </button>
            <button className={`tool-btn ${tool === "circle" ? "active" : ""}`} onClick={() => setTool("circle")} title="Circle">
                <CircleIcon size={20} />
            </button>
            <div style={{ width: '1px', background: 'var(--ui-border)', margin: '0 4px' }} />
            <button className="tool-btn" onClick={undo} title="Undo">
                <Undo2 size={20} />
            </button>
            <button className="tool-btn" onClick={redo} title="Redo">
                <Redo2 size={20} />
            </button>
        </div>
    )
}
export default Toolbar;