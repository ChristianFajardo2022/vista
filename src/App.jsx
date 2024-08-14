import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import VideoPlayer from './VideoPlayer'
import EmotionDetector from './EmotionDetector'

function App() {

  return (
    <>
    <div className='w-full h-full overflow-hidden p-0 m-0' >
    <VideoPlayer />
    <EmotionDetector />
    </div>
      
      
    </>
  )
}

export default App
