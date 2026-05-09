import Canvas from './components/Canvas'
import Toolbar from './components/Toolbar'
import PropertyPanel from './components/PropertyPanel'
import MenuBar from './components/MenuBar'
import { Routes, Route ,Navigate,useParams} from 'react-router-dom';
import { SignedIn,SignedOut,SignInButton } from '@clerk/clerk-react';
import { useEffect } from 'react';
import useStore from './store';
import { useUser } from '@clerk/clerk-react';


function ExcalidrawRoom() {
    // We will use this roomId in the next step to connect to Yjs!
    const { roomId } = useParams();
    const { connectToRoom } = useStore();
    const { user, isLoaded } = useUser();
    useEffect(() => {
        if (isLoaded) {
           connectToRoom(roomId, user);
        }
    }, [roomId, isLoaded, user, connectToRoom]);
    
    return (
       <>
          {/* If they are logged in, show the canvas */}
          <SignedIn>
              <MenuBar />
              <Toolbar />
              <PropertyPanel />
              <Canvas />
          </SignedIn>
          
          {/* If they are NOT logged in, show a beautiful prompt */}
          <SignedOut>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#121212', color: 'white' }}>
                  <h1 style={{ marginBottom: '1rem' }}>Welcome to Collaborative Excalidraw</h1>
                  <p style={{ marginBottom: '2rem', fontSize: '1.2rem', color: '#aaa' }}>
                      Please sign in to join room: <strong>{roomId}</strong>
                  </p>
                  <SignInButton mode="modal">
                      <button style={{ padding: '12px 24px', fontSize: '18px', cursor: 'pointer', background: '#a48cfa', color: 'black', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
                          Sign In to Collaborate
                      </button>
                  </SignInButton>
              </div>
          </SignedOut>
       </>
    );
}

function App() {
  // Generate a random 7-character string for a new room
  const randomRoomId = Math.random().toString(36).substring(2, 9);
  
  return (
    <Routes>
      {/* If they visit localhost:5173/, redirect them to localhost:5173/room/[random] */}
      <Route path="/" element={<Navigate to={`/room/${randomRoomId}`} replace />} />
      
      {/* The actual room route! */}
      <Route path="/room/:roomId" element={<ExcalidrawRoom />} />
    </Routes>
  )
}


export default App
