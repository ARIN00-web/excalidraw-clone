// src/ai.js
export const generateShapes = async (prompt, stagePos = { x: 0, y: 0 }) => {
    // Vite uses import.meta.env to grab variables from your .env file securely!
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    // Calculate the center of the screen based on the current pan position!
    const centerX = -stagePos.x + window.innerWidth / 2;
    const centerY = -stagePos.y + window.innerHeight / 2;

    // We give Gemini a highly specific system prompt so it knows EXACTLY what to do
    const systemPrompt = `
    You are an AI assistant built into an Excalidraw clone. The user will ask you to draw something.
    You must respond with ONLY a raw JSON array of shapes representing their request.
    Do NOT include markdown formatting (no \`\`\`json). Just the raw array!
    
    Valid shape types are: "rect", "circle", "line", "text", "rhombus", "arrow".
    Every shape must have: id (unique string), type, x, y, fill (color string), stroke (color string), strokeWidth (number).
    - Rectangles/Circles need: width, height
    - Lines/Arrows need: width, height
    - Text needs: text (string)
    
    Make the drawing centered around x: ${Math.round(centerX)}, y: ${Math.round(centerY)}.
    `;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: systemPrompt + "\n\nUser Request: " + prompt }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                }
            })
        });

        const data = await response.json();
        
        if (!data.candidates) {
            console.error("API Error Details:", data);
            if (data.error && data.error.code === 429) {
                alert("Whoa there! Google's free API limits you to a few requests per minute. Please wait 60 seconds and try again!");
            } else {
                alert("API Error: " + (data.error?.message || "Unknown error"));
            }
            return [];
        }

        let resultText = data.candidates[0].content.parts[0].text.trim();
        
        // Strip out markdown code blocks if the AI decides to ignore our rules!
        if (resultText.startsWith("```json")) {
            resultText = resultText.replace(/^```json\n?/, "").replace(/```$/, "").trim();
        } else if (resultText.startsWith("```")) {
            resultText = resultText.replace(/^```\n?/, "").replace(/```$/, "").trim();
        }

        // Failsafe: extract only the array brackets if there's extra conversational text
        const startIndex = resultText.indexOf('[');
        const endIndex = resultText.lastIndexOf(']');
        if (startIndex !== -1 && endIndex !== -1) {
            resultText = resultText.substring(startIndex, endIndex + 1);
        }
        
        const shapes = JSON.parse(resultText);
        
        // Give them fresh IDs to avoid React key collisions
        return shapes.map(s => ({ ...s, id: Date.now().toString() + Math.random() }));
    } catch (e) {
        console.error("Failed to parse AI response. Error:", e);
        alert("The AI got confused or the prompt was too complex! Try rephrasing.");
        return [];
    }
};
