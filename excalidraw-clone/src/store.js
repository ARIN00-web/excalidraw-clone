import { create } from 'zustand';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
// Global variables for the math engine (Y-Doc) - but don't connect yet!
let ydoc = new Y.Doc();
export let yShapes = ydoc.getArray("shapes");
export let undoManager = new Y.UndoManager(yShapes);
let provider = null;
let awareness = null;
const cursorColors = ["#FF5733", "#33FF57", "#3357FF", "#F033FF", "#FFC300", "#00FFD1", "#FF0055"];
// Think of this like a giant App.jsx that has no visible UI.


const useStore = create((set, get) => {
    return ({
        // --- 1. THE VARIABLES ---
        shapes: [],
        tool: "select",
        color: "#a48cfa",
        fillStyle: "translucent",
        stagePos: { x: 0, y: 0 },
        selectedShape: null,
        strokeWidth: 2, 
        canvasBackground: "#121212", 
        cursors: {}, // NEW: Store other users' cursors
        isPropertyPanelVisible: false,
        // --- 2. SIMPLE SETTERS ---
        // Notice how we use set() to update exactly one property without touching the others
        setStagePos: (pos) => set({ stagePos: pos }),
        setFillStyle: (style) => set({ fillStyle: style }),
        setTool: (newTool) => set({ tool: newTool }),
        setShapes: (newShapes) => set({ shapes: newShapes }),
        setColor: (newColor) => set({ color: newColor }),
        setSelectedShape: (id) => set({ selectedShape: id }),
        setStrokeWidth: (width) => set({ strokeWidth: width }),
        setCanvasBackground: (bg) => set({ canvasBackground: bg }),
        setCursors: (newCursors) => set({ cursors: newCursors }),
        setPropertyPanelVisible: (visible) => set({ isPropertyPanelVisible: visible }),

                // --- 3. DYNAMIC CONNECTION ---
        connectToRoom: (roomId, user) => {
            if (provider) {
                provider.destroy();
                ydoc.destroy();
            }

            ydoc = new Y.Doc();
            yShapes = ydoc.getArray("shapes");
            undoManager = new Y.UndoManager(yShapes);

            const wsUrl = import.meta.env.VITE_WS_URL || `ws://${window.location.hostname}:1234`;
            provider = new WebsocketProvider(
                wsUrl, 
                roomId,      
                ydoc
            );
            awareness = provider.awareness;

            const randomColor = cursorColors[Math.floor(Math.random() * cursorColors.length)];

            // Tell the room who we are using Clerk's user object!
            awareness.setLocalStateField('user', {
                name: user?.firstName || user?.username || `User ${Math.floor(Math.random() * 1000)}`,
                color: randomColor,
                avatar: user?.imageUrl,
                cursor: null
            });

            provider.on('status', event => {
                console.log("NETWORK STATUS IS NOW: ", event.status);
            });

            yShapes.observe(() => {
                set({ shapes: yShapes.toJSON() });
            });

            awareness.on('change', () => {
                const allStates = Array.from(awareness.getStates().entries());
                const newCursors = {};
                
                allStates.forEach(([clientId, state]) => {
                    // Only save other people's cursors, not our own!
                    if (clientId !== awareness.clientID && state.user && state.user.cursor) {
                        newCursors[clientId] = state.user;
                    }
                });
                
                set({ cursors: newCursors });
            });

            // Initial load
            set({ shapes: yShapes.toJSON(), cursors: {} });
        },

        updateCursorPosition: (x, y) => {
            if (awareness) {
                const currentState = awareness.getLocalState()?.user || {};
                awareness.setLocalStateField('user', {
                    ...currentState,
                    cursor: { x, y }
                });
            }
        },



        // --- 3. COMPLEX LOGIC (Time Travel) ---
        undo: () => undoManager.undo(),
        redo: () => undoManager.redo(),

            

        updateShapes: (newShapesArray) => {
            ydoc.transact(() => {
                yShapes.delete(0, yShapes.length);
                yShapes.insert(0, newShapesArray);
            });
        },

        handleColorChange: (newColor) => {
            // 1. Grab everything we need from the store
            const { selectedShape, shapes, fillStyle } = get();

            // 2. Set the blueprint color
            set({ color: newColor });

            // 3. Update the existing shape if one is selected
            if (selectedShape !== null) {
              
                const updatedShapes = shapes.map((s) => {
                    if (s.id === selectedShape) {
                        // Smart styling: check fillStyle!
                        return { 
                            ...s, 
                            stroke: newColor,
                            fill: fillStyle === "solid" ? newColor : fillStyle === "translucent" ? newColor + "33" : "transparent"
                        };
                    }
                    return s;
                });

                // 4. Call our own store function!
                get().updateShapes(updatedShapes);
            }
        },

        handleFillStyleChange: (newStyle) => {
            const { selectedShape, shapes } = get();
            set({ fillStyle: newStyle });
            if (selectedShape !== null) {
                const updatedShapes = shapes.map((s) => {
                    if (s.id === selectedShape) {
                        return { 
                            ...s, 
                            fill: newStyle === "solid" ? s.stroke : newStyle === "translucent" ? s.stroke + "33" : "transparent"
                        };
                    }
                    return s;
                });
                get().updateShapes(updatedShapes);
            }
        }
    });
});





export default useStore;
