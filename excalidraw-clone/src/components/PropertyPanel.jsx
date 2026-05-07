import React from "react";
import useStore from "../store";
import './PropertyPanel.css';
const COLORS = ["#ff6b6b", "#4dabf7", "#51cf66", "#fcc419", "#a48cfa", "#ffffff"];
const BACKGROUNDS = ["#121212", "#1e1e2e", "#f8f9fa", "#fff9db"]; 
function PropertyPanel() {
    const { 
        tool, selectedShape,
        handleColorChange, color,
        strokeWidth, setStrokeWidth,
        canvasBackground, setCanvasBackground
    } = useStore();
    // EXCALIDRAW MAGIC: Only show the panel IF we are drawing a shape/pen, OR if we have clicked a shape!
    if (tool === "select" && selectedShape === null) {
        return null;
    }
    return (
        <div className="property-panel">
            <span className="panel-label">Stroke</span>
            <div className="color-picker-grid">
                {COLORS.map(c => (
                    <button key={c} className={`color-btn ${color === c ? "active" : ""}`} onClick={() => handleColorChange(c)}>
                        <div className="color-swatch" style={{ background: c }} />
                    </button>
                ))}
            </div>
            <span className="panel-label">Background</span>
            <div className="color-picker-grid">
                {BACKGROUNDS.map(bg => (
                    <button key={bg} className={`color-btn ${canvasBackground === bg ? "active" : ""}`} onClick={() => setCanvasBackground(bg)}>
                        <div className="color-swatch" style={{ background: bg, border: '1px solid var(--ui-border)' }} />
                    </button>
                ))}
            </div>
            <span className="panel-label">Stroke Width</span>
            <div className="stroke-widths-row">
                <button className={`stroke-btn ${strokeWidth === 2 ? "active" : ""}`} onClick={() => setStrokeWidth(2)}>
                    <div className="stroke-icon" style={{ width: 16, height: 2 }} />
                </button>
                <button className={`stroke-btn ${strokeWidth === 4 ? "active" : ""}`} onClick={() => setStrokeWidth(4)}>
                    <div className="stroke-icon" style={{ width: 16, height: 4 }} />
                </button>
                <button className={`stroke-btn ${strokeWidth === 8 ? "active" : ""}`} onClick={() => setStrokeWidth(8)}>
                    <div className="stroke-icon" style={{ width: 16, height: 8 }} />
                </button>
            </div>
        </div>
    );
}
export default PropertyPanel;