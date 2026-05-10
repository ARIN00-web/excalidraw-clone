import React from "react";
import useStore from "../store";
import { X } from "lucide-react";
import './PropertyPanel.css';
const COLORS = ["#ff6b6b", "#4dabf7", "#51cf66", "#fcc419", "#a48cfa", "#ffffff"];
const BACKGROUNDS = ["#121212", "#1e1e2e", "#f8f9fa", "#fff9db"]; 
function PropertyPanel() {
    const { 
        tool, selectedShape,
        handleColorChange, color,
        strokeWidth, setStrokeWidth,
        canvasBackground, setCanvasBackground,
        fillStyle, handleFillStyleChange,
        isPropertyPanelVisible, setPropertyPanelVisible
    } = useStore();
    // EXCALIDRAW MAGIC: Only show the panel IF we are drawing a shape/pen, OR if we have clicked a shape!
    // ALSO check if they manually closed it!
    if (!isPropertyPanelVisible || (tool === "select" && selectedShape === null)) {
        return null;
    }
    return (
        <div className="property-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="panel-label">Stroke & Fill</span>
                <button onClick={() => setPropertyPanelVisible(false)} className="stroke-btn" style={{ padding: '4px' }} title="Close">
                    <X size={16} />
                </button>
            </div>
            <div className="color-picker-grid" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {COLORS.map(c => (
                    <button key={c} className={`color-btn ${color === c ? "active" : ""}`} onClick={() => handleColorChange(c)}>
                        <div className="color-swatch" style={{ background: c }} />
                    </button>
                ))}
                <input 
                    type="color" 
                    value={color.slice(0, 7)} 
                    onChange={(e) => handleColorChange(e.target.value)} 
                    style={{ width: '28px', height: '28px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer', outline: 'none', background: 'transparent' }}
                    title="Custom Color"
                />
            </div>
            <span className="panel-label">Background</span>
            <div className="color-picker-grid">
                {BACKGROUNDS.map(bg => (
                    <button key={bg} className={`color-btn ${canvasBackground === bg ? "active" : ""}`} onClick={() => setCanvasBackground(bg)}>
                        <div className="color-swatch" style={{ background: bg, border: '1px solid var(--ui-border)' }} />
                    </button>
                ))}
            </div>
            <span className="panel-label">Fill Style</span>
            <div className="stroke-widths-row">
                <button className={`stroke-btn ${fillStyle === "transparent" ? "active" : ""}`} onClick={() => handleFillStyleChange("transparent")} title="Transparent">
                    <div style={{ width: 16, height: 16, border: '2px dashed var(--text-secondary)', borderRadius: 2 }} />
                </button>
                <button className={`stroke-btn ${fillStyle === "translucent" ? "active" : ""}`} onClick={() => handleFillStyleChange("translucent")} title="Translucent">
                    <div style={{ width: 16, height: 16, border: '2px solid var(--text-secondary)', backgroundColor: 'var(--ui-border)', borderRadius: 2 }} />
                </button>
                <button className={`stroke-btn ${fillStyle === "solid" ? "active" : ""}`} onClick={() => handleFillStyleChange("solid")} title="Solid">
                    <div style={{ width: 16, height: 16, backgroundColor: 'var(--text-secondary)', borderRadius: 2 }} />
                </button>
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