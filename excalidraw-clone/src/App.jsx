import Canvas from './components/Canvas'
import Toolbar from './components/Toolbar'
import PropertyPanel from './components/PropertyPanel'
import MenuBar from './components/MenuBar'
function App() {
  return (
    <>
      <MenuBar /> {/* <--- ADD COMPONENT */}{/* Look! NO PROPS! */}
      <Toolbar />
      <PropertyPanel />
      <Canvas />
    </>
  )
}

export default App
