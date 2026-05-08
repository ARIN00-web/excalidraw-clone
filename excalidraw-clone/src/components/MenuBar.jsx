import React, { useState } from 'react';
import useStore from '../store';
import { Menu, Trash2, Download, LogIn, Users, Sparkles } from 'lucide-react';
import './MenuBar.css';

function MenuBar() {
    const [isOpen, setIsOpen] = useState(false);
    const { updateShapes } = useStore();

    return (
        <div className="menu-bar-container">
            {/* The Upward Popping Menu */}
            <div className={`menu-dropdown ${isOpen ? "open" : ""}`}>
                <button className="menu-item">
                    <LogIn size={18} /> Sign In
                </button>
                <div className="menu-divider" />
                <button className="menu-item" onClick={() => {
                    window.dispatchEvent(new Event("export-canvas"));
                    setIsOpen(false);
                }}>
                    <Download size={18} /> Export Image
                </button>
                <button className="menu-item" onClick={() => {
                    // Use a standard browser confirm box so they don't accidentally click it!
                    if (window.confirm("Are you sure you want to completely clear the canvas?")) {
                        updateShapes([]); // Wiping the store instantly clears the canvas!
                        setIsOpen(false);
                    }
                }}>
                    <Trash2 size={18} color="#ff4a4a" /> <span style={{color: "#ff4a4a"}}>Clear Canvas</span>
                </button>
                <div className="menu-divider" />
                <button className="menu-item" style={{opacity: 0.5}} title="Coming Soon!">
                    <Users size={18} /> Live Collaboration
                </button>
                <button className="menu-item" style={{opacity: 0.5}} title="Coming Soon!">
                    <Sparkles size={18} /> AI Magic Generate
                </button>
            </div>

            {/* The Hamburger Button */}
            <button className="menu-trigger" onClick={() => setIsOpen(!isOpen)}>
                <Menu size={24} />
            </button>
        </div>
    );
}

export default MenuBar;
