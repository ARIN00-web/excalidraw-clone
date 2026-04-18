import { useState } from 'react'
import Canvas from './components/Canvas'
import Toolbar from './components/Toolbar'

function App() {
  const [shapes, setshapes] = useState([]);
  const [tool, setTool] = useState("select");
    const [color, setColor] = useState("red"); 

  return (
    <>
      <Toolbar setTool={setTool}  setColor={setColor}/>
      <Canvas
        shapes={shapes}
        setShapes={setshapes}
        tool={tool}
        color={color}
      />

    </>
  )
}

export default App
