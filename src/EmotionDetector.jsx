import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

const EmotionDetector = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [emotion, setEmotion] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
        await faceapi.nets.faceExpressionNet.loadFromUri('/models');
      } catch (err) {
        console.error('Error loading models:', err);
      }
    };

    loadModels();
  }, []);

  const handlePlay = async () => {
    const videoElement = videoRef.current;
    const canvas = canvasRef.current;

    const displaySize = { width: videoElement.videoWidth, height: videoElement.videoHeight };
    faceapi.matchDimensions(canvas, displaySize);

    const interval = setInterval(async () => {
      try {
        const detections = await faceapi.detectAllFaces(videoElement, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions();

        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

        if (detections.length > 0) {
          const expressions = detections[0].expressions;
          const detectedEmotion = Object.keys(expressions).reduce((a, b) => expressions[a] > expressions[b] ? a : b);

          if (detectedEmotion && detectedEmotion !== emotion) {
            setEmotion(detectedEmotion);
            setShowPopup(true);
            setTimeout(() => {
              setShowPopup(false);
            }, 2000);
          }
        }
      } catch (err) {
        console.error('Error during face detection:', err);
      }
    }, 100);

    videoElement.addEventListener('pause', () => clearInterval(interval));
  };

  const startCamera = () => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      .then(stream => {
        const videoElement = videoRef.current;
        videoElement.srcObject = stream;
        videoElement.onloadedmetadata = () => {
          videoElement.play();
        };
      })
      .catch(err => console.error('Error accessing webcam:', err));
  };

  useEffect(() => {
    startCamera();
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <video
        ref={videoRef}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
        onPlay={handlePlay}
        muted
        playsInline
      />
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      />
      {showPopup && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          padding: '20px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          borderRadius: '10px',
          opacity: showPopup ? 1 : 0,
          transition: 'opacity 0.5s ease-in-out'
        }}>
          Estás {emotion}
        </div>
      )}
    </div>
  );
};

export default EmotionDetector;
