import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import Video from "../src/assets/playa.mp4";

const VideoPlayer = () => {
  const videoRef = useRef(null);
  const [hasDetectedFace, setHasDetectedFace] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      } catch (err) {
        console.error('Error loading models:', err);
      }
    };

    loadModels();
    startCamera();
  }, []);

  const startCamera = () => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(stream => {
        const videoElement = document.createElement('video');
        videoElement.srcObject = stream;
        videoElement.play();

        videoElement.addEventListener('play', () => {
          const interval = setInterval(async () => {
            try {
              const detections = await faceapi.detectAllFaces(videoElement, new faceapi.TinyFaceDetectorOptions());

              if (detections.length > 0 && !hasDetectedFace) {
                setHasDetectedFace(true);
                alert('Ojos detectados'); // Muestra un mensaje emergente solo la primera vez
              }
            } catch (err) {
              console.error('Error during face detection:', err);
            }
          }, 100);

          videoElement.addEventListener('pause', () => {
            clearInterval(interval);
          });
        });
      })
      .catch(err => console.error('Error accessing webcam:', err));
  };

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <video
        ref={videoRef}
        loop
        autoPlay
        muted
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover', // Hace que el video ocupe toda la pantalla manteniendo la relación de aspecto
          filter: hasDetectedFace ? 'none' : 'blur(10px)', // Aplica o quita el blur según la detección
          transition: 'filter 0.3s ease-in-out', // Transición suave entre estados
        }}
        src={Video}
      />
    </div>
  );
};

export default VideoPlayer;
