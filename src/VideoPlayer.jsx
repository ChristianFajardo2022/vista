import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import Video from "../src/assets/playa.mp4";

const VideoPlayer = () => {
  const videoRef = useRef(null);
  const [isHumanDetected, setIsHumanDetected] = useState(false);

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
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }) // Usa la cámara trasera del móvil
      .then(stream => {
        const videoElement = document.createElement('video');
        videoElement.srcObject = stream;
        videoElement.play();

        videoElement.addEventListener('play', () => {
          const interval = setInterval(async () => {
            try {
              const detections = await faceapi.detectAllFaces(videoElement, new faceapi.TinyFaceDetectorOptions());

              if (detections.length > 0) {
                setIsHumanDetected(true);
              } else {
                setIsHumanDetected(false);
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

  useEffect(() => {
    if (isHumanDetected) {
      alert('Ojos detectados'); // Muestra un mensaje emergente
    }
  }, [isHumanDetected]);

  return (
    <div>
      <video
        ref={videoRef}
        width="720"
        height="560"
        loop
        autoPlay
        muted
        style={{
          filter: isHumanDetected ? 'none' : 'blur(10px)', // Aplica o quita el blur según la detección
          transition: 'filter 0.3s ease-in-out', // Transición suave entre estados
        }}
        src={Video}
      />
    </div>
  );
};

export default VideoPlayer;
