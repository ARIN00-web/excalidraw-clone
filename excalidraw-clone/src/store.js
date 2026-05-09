import { create } from 'zustand';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';



// 1. Create the math engine (Y-Doc)
const ydoc = new Y.Doc();

// 2. Create the multiplayer array specifically for our shapes!
export const yShapes = ydoc.getArray("shapes");
export const undoManager = new Y.UndoManager(yShapes);

// 3. Connect your engine to the public internet
const provider = new WebsocketProvider(
    `ws://${window.location.hostname}:1234`, // Dynamically connects to whoever is hosting!
    "bharat-excalidraw-room-1",      // Your secret room name!
    ydoc
);

// 👇 THIS IS THE NEW AWARENESS PROTOCOL 👇
export const awareness = provider.awareness;

// Assign a random color and name to this user when they join
const cursorColors = ["#FF5733", "#33FF57", "#3357FF", "#F033FF", "#FFC300", "#00FFD1", "#FF0055"];
const randomColor = cursorColors[Math.floor(Math.random() * cursorColors.length)];

// Initialize this user's state
awareness.setLocalStateField('user', {
    name: `User ${Math.floor(Math.random() * 1000)}`,
    color: randomColor,
    cursor: null // They haven't moved their mouse yet!
});


provider.on('status', event => {
    console.log("NETWORK STATUS IS NOW: ", event.status);
});

// Think of this like a giant App.jsx that has no visible UI.
const useStore = create((set, get) => {
    return ({
        // --- 1. THE VARIABLES ---
        shapes: [],
        tool: "select",
        color: "red",
        selectedShape: null,
        strokeWidth: 2, 
        canvasBackground: "#121212", 
        cursors: {}, // NEW: Store other users' cursors
        // --- 2. SIMPLE SETTERS ---
        // Notice how we use set() to update exactly one property without touching the others
        setTool: (newTool) => set({ tool: newTool }),
        setShapes: (newShapes) => set({ shapes: newShapes }),
        setColor: (newColor) => set({ color: newColor }),
        setSelectedShape: (id) => set({ selectedShape: id }),
        setStrokeWidth: (width) => set({ strokeWidth: width }),
        setCanvasBackground: (bg) => set({ canvasBackground: bg }),
        setCursors: (newCursors) => set({ cursors: newCursors }),
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
            const { selectedShape, shapes } = get();

            // 2. Set the blueprint color
            set({ color: newColor });

            // 3. Update the existing shape if one is selected
            if (selectedShape !== null) {
              
                const updatedShapes = shapes.map((s) => {
                    if (s.id === selectedShape) {
                        return { ...s, fill: newColor, stroke: newColor };
                    }
                    return s;
                });

                // 4. Call our own store function!
                get().updateShapes(updatedShapes);
            }
        }
    });
});

yShapes.observe(() => {
    console.log("MATH ENGINE FIRED! Current Shapes: ", yShapes.toJSON());
    useStore.getState().setShapes(yShapes.toJSON());
});

// Listen for other people moving their mice!
awareness.on('change', () => {
    const allStates = Array.from(awareness.getStates().entries());
    const newCursors = {};
    
    allStates.forEach(([clientId, state]) => {
        // Only save other people's cursors, not our own!
        if (clientId !== awareness.clientID && state.user && state.user.cursor) {
            newCursors[clientId] = state.user;
        }
    });
    
    useStore.getState().setCursors(newCursors);
});



export default useStore;
