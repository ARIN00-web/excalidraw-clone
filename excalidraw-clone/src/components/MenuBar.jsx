import React, { useState } from 'react';
import useStore from '../store';
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { Menu, Trash2, Download, LogIn, Users, Sparkles } from 'lucide-react';
import './MenuBar.css';
import { generateShapes } from '../ai';


function MenuBar() {
    const [isOpen, setIsOpen] = useState(false);
    const { updateShapes } = useStore();

    return (
        <div className="menu-bar-container">
            {/* The Upward Popping Menu */}
            <div className={`menu-dropdown ${isOpen ? "open" : ""}`}>
                <div className="menu-item" style={{ padding: "6px 12px" }}>
                    <SignedOut>
                        <SignInButton mode="modal">
                            <button style={{background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', width: '100%', fontSize: '14px', fontWeight: '500'}}>
                                <LogIn size={18} /> Sign In
                            </button>
                        </SignInButton>
                    </SignedOut>
                    <SignedIn>
                        <UserButton showName={true} />
                    </SignedIn>
                </div>
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
                <button className="menu-item" onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Room link copied! Share it with your friends.");
                    setIsOpen(false);
                }}>
                    <Users size={18} /> Copy Invite Link
                </button>

                <button className="menu-item" onClick={async () => {
                    const promptText = prompt("What would you like the AI to draw? (e.g. 'A red rectangle with the text Hello inside it')");
                    if (promptText) {
                        setIsOpen(false);
                        const newShapes = await generateShapes(promptText, useStore.getState().stagePos);
                        if (newShapes.length > 0) {
                            // Inject the AI's mind directly into our store!
                            updateShapes([...useStore.getState().shapes, ...newShapes]);
                        }
                    }
                }}>
                    <Sparkles size={18} color="#FFD700" /> <span style={{color: "#FFD700"}}>AI Magic Generate</span>
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
