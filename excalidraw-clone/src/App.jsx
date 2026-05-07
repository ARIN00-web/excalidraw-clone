import Canvas from './components/Canvas'
import Toolbar from './components/Toolbar'
import PropertyPanel from './components/PropertyPanel'
function App() {
  return (
    <>
      {/* Look! NO PROPS! */}
      <Toolbar />
      <PropertyPanel />
      <Canvas />
    </>
  )
}

export default App
