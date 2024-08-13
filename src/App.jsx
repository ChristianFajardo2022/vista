import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import VideoPlayer from './VideoPlayer'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <div className='w-full h-full' >
    <h1>Probando</h1>
    <VideoPlayer />
    </div>
      
      
    </>
  )
}

export default App
