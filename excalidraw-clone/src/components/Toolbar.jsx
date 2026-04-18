import react from "react";

function Toolbar({setTool, setColor}){
    return(
        <div>
            <button onClick = {() => setTool("select")}>Select</button>
            <button onClick = {() => setTool("rect")}>Rectangle</button>
            <button onClick = {() => setColor("red")}>Red</button>
            <button onClick = {() => setColor("blue")}>Blue</button>
            <button onClick = {() => setColor("green")}>Green</button>
        </div>
    )
}

export default Toolbar;