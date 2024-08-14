import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import Video from "../src/assets/playa.mp4";

const VideoPlayer = () => {
  const videoRef = useRef(null);
  const [hasDetectedFace, setHasDetectedFace] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

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
                clearInterval(interval); // Detener la detección inmediatamente
                setHasDetectedFace(true);
                setShowPopup(true); // Mostrar el popup

                setTimeout(() => {
                  setShowPopup(false); // Desvanecer el popup después de 2 segundos
                }, 2000);
              }
            } catch (err) {
              console.error('Error during face detection:', err);
            }
          }, 100);
        });
      })
      .catch(err => console.error('Error accessing webcam:', err));
  };

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      <video
        ref={videoRef}
        loop
        autoPlay
        muted
        playsInline
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover', // Hace que el video ocupe toda la pantalla manteniendo la relación de aspecto
          filter: hasDetectedFace ? 'none' : 'blur(10px)', // Aplica o quita el blur según la detección
          transition: 'filter 0.3s ease-in-out', // Transición suave entre estados
        }}
        src={Video}
      />
      {showPopup && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          padding: '200px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          borderRadius: '10px',
          opacity: showPopup ? 1 : 0,
          transition: 'opacity 0.5s ease-in-out',
          fontSize: "30px",
        }}>
          Ojos detectados con exito!
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
