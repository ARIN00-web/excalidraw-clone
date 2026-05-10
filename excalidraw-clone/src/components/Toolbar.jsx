import React, {useRef} from "react";
import useStore from "../store";
import './Toolbar.css';
import { MousePointer2, Square, Circle as CircleIcon, Pen, Undo2, Redo2,Eraser ,Type, Download,Diamond, ArrowUpRight ,Minus,Image as ImageIcon, Hand, Palette} from 'lucide-react';
function Toolbar() {
    const { tool, setTool, undo, redo, isPropertyPanelVisible, setPropertyPanelVisible } = useStore();
     const fileInputRef = useRef(null); //
    return (
        <div className="toolbar">
            <button className={`tool-btn ${tool === "hand" ? "active" : ""}`} onClick={() => setTool("hand")} title="Pan Canvas">
                <Hand size={20} />
            </button>
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
                        <button className={`tool-btn ${tool === "arrow" ? "active" : ""}`} onClick={() => setTool("arrow")} title="Arrow">
                <ArrowUpRight size={20} />
            </button>
            <button className={`tool-btn ${tool === "line" ? "active" : ""}`} onClick={() => setTool("line")} title="Straight Line">
                <Minus size={20} />
            </button>

            <button className={`tool-btn ${tool === "text" ? "active" : ""}`} onClick={() => setTool("text")} title="Text">
                <Type size={20} />
            </button>
            <div style={{ width: '1px', background: 'var(--ui-border)', margin: '0 4px' }} />
            <button className={`tool-btn ${isPropertyPanelVisible ? "active" : ""}`} onClick={() => setPropertyPanelVisible(!isPropertyPanelVisible)} title="Toggle Properties">
                <Palette size={20} />
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
                        {/* The hidden file input that actually handles the file selection */}
            <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: "none" }} 
                accept="image/*" 
                onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                            // Tell the Canvas that we have a base64 string ready to drop!
                            window.dispatchEvent(new CustomEvent("upload-image", { detail: event.target.result }));
                        };
                        reader.readAsDataURL(file); // This converts the image to the Base64 string
                    }
                    e.target.value = null; // Reset the input so you can upload the same image twice if you want
                }} 
            />
            {/* The visible button that clicks the hidden input */}
            <button className="tool-btn" onClick={() => fileInputRef.current.click()} title="Upload Image">
                <ImageIcon size={20} />
            </button>


        </div>
    )
}
export default Toolbar;