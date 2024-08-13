import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

const VideoPlayer = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isHumanDetected, setIsHumanDetected] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    };

    loadModels();
    startVideo();

    videoRef.current.addEventListener('play', () => {
      const canvas = faceapi.createCanvasFromMedia(videoRef.current);
      canvasRef.current.append(canvas);
      const displaySize = { width: videoRef.current.width, height: videoRef.current.height };
      faceapi.matchDimensions(canvas, displaySize);

      setInterval(async () => {
        const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

        if (detections.length > 0) {
          setIsHumanDetected(true);
        } else {
          setIsHumanDetected(false);
        }
      }, 100);
    });
  }, []);

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: {} })
      .then(stream => {
        videoRef.current.srcObject = stream;
      })
      .catch(err => console.error('Error accessing webcam: ', err));
  };

  useEffect(() => {
    if (isHumanDetected) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  }, [isHumanDetected]);

  return (
    <div>
      <video ref={videoRef} width="720" height="560" autoPlay muted />
      <div ref={canvasRef}></div>
    </div>
  );
};

export default VideoPlayer;
