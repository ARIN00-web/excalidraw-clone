import React from "react";
import useStore from "../store";
import './Toolbar.css';
import { MousePointer2, Square, Undo2, Redo2 } from 'lucide-react';

function Toolbar() {
    // Notice we now pull 'tool' from the store so we know which one is active!
    const { tool, setTool, handleColorChange, undo, redo } = useStore();

    return (
        <div className="toolbar">
            {/* The active class is dynamically applied if this tool is currently selected */}
            <button 
                className={`tool-btn ${tool === "select" ? "active" : ""}`} 
                onClick={() => setTool("select")}
                title="Select"
            >
                <MousePointer2 size={20} />
            </button>
            <button 
                className={`tool-btn ${tool === "rect" ? "active" : ""}`} 
                onClick={() => setTool("rect")}
                title="Rectangle"
            >
                <Square size={20} />
            </button>
            
            {/* Vertical Divider */}
            <div style={{ width: '1px', background: 'var(--ui-border)', margin: '0 4px' }} />

            {/* Colors */}
            <button className="tool-btn" onClick={() => handleColorChange("#ff6b6b")}>
                <div className="color-swatch" style={{ background: '#ff6b6b' }} />
            </button>
            <button className="tool-btn" onClick={() => handleColorChange("#4dabf7")}>
                <div className="color-swatch" style={{ background: '#4dabf7' }} />
            </button>
            <button className="tool-btn" onClick={() => handleColorChange("#51cf66")}>
                <div className="color-swatch" style={{ background: '#51cf66' }} />
            </button>

            {/* Vertical Divider */}
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
