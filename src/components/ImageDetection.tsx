import React, { useEffect, useRef, useState } from 'react';
import { 
  createFaceLandmarker, 
  setRunningMode, 
  drawBlendShapes, 
  FaceLandmarker, 
  DrawingUtils 
} from '../utils/FaceLandmarkerUtils';

const ImageDetection: React.FC = () => {
  const [faceLandmarkerLoaded, setFaceLandmarkerLoaded] = useState(false);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadFaceLandmarker = async () => {
      try {
        faceLandmarkerRef.current = await createFaceLandmarker("IMAGE");
        setFaceLandmarkerLoaded(true);
        console.log("FaceLandmarker initialized in IMAGE mode");
      } catch (error) {
        console.error('Error loading FaceLandmarker:', error);
      }
    };

    loadFaceLandmarker();
  }, []);

  const handleImageClick = async (event: React.MouseEvent<HTMLImageElement>) => {
    if (!faceLandmarkerRef.current) {
      console.log("Wait for faceLandmarker to load before clicking!");
      return;
    }

    await setRunningMode("IMAGE");

    const image = event.target as HTMLImageElement;
    const imageContainer = image.parentNode as HTMLElement;
    
    // Remove all landmarks drawn before
    const allCanvas = imageContainer.getElementsByClassName("canvas");
    for (let i = allCanvas.length - 1; i >= 0; i--) {
      const n = allCanvas[i];
      if (n.parentNode) {
        n.parentNode.removeChild(n);
      }
    }

    // Detect and draw landmarks
    try {
      const faceLandmarkerResult = faceLandmarkerRef.current.detect(image);
      
      const canvas = document.createElement("canvas");
      canvas.setAttribute("class", "canvas");
      canvas.setAttribute("width", image.naturalWidth + "px");
      canvas.setAttribute("height", image.naturalHeight + "px");
      canvas.style.left = "0px";
      canvas.style.top = "0px";
      canvas.style.width = `${image.width}px`;
      canvas.style.height = `${image.height}px`;
  
      imageContainer.appendChild(canvas);
      const ctx = canvas.getContext("2d");
      
      if (ctx) {
        const drawingUtils = new DrawingUtils(ctx);
        
        for (const landmarks of faceLandmarkerResult.faceLandmarks) {
          drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_TESSELATION,
            { color: "#C0C0C070", lineWidth: 1 }
          );
          drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
            { color: "#FF3030" }
          );
          drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
            { color: "#FF3030" }
          );
          drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
            { color: "#30FF30" }
          );
          drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
            { color: "#30FF30" }
          );
          drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
            { color: "#E0E0E0" }
          );
          drawingUtils.drawConnectors(
            landmarks, 
            FaceLandmarker.FACE_LANDMARKS_LIPS, 
            { color: "#E0E0E0" }
          );
          drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,
            { color: "#FF3030" }
          );
          drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
            { color: "#30FF30" }
          );
        }
      }
      
      // Draw blend shapes
      const imageBlendShapes = document.getElementById("image-blend-shapes");
      if (imageBlendShapes) {
        drawBlendShapes(imageBlendShapes, faceLandmarkerResult.faceBlendshapes);
      }
    } catch (error) {
      console.error('Error detecting image:', error);
    }
  };

  return (
    <>
      <h2>이미지에서 얼굴 감지하기</h2>
      <p><b>아래 이미지를 클릭하면</b> 얼굴의 주요 랜드마크를 볼 수 있습니다.</p>

      <div className="detectOnClick" ref={imageContainerRef}>
        <img 
          src="https://storage.googleapis.com/mediapipe-assets/portrait.jpg" 
          width="100%" 
          crossOrigin="anonymous" 
          title="Click to get detection!" 
          onClick={handleImageClick}
          alt="Face detection sample"
        />
      </div>
      <div className="blend-shapes">
        <ul className="blend-shapes-list" id="image-blend-shapes"></ul>
      </div>
    </>
  );
};

export default ImageDetection; 