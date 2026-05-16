
import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import { Camera } from 'lucide-react';

interface HandTrackerProps {
  onHandUpdate: (x: number, y: number, isPinching: boolean) => void;
  isActive: boolean;
}

const HandTracker: React.FC<HandTrackerProps> = ({ onHandUpdate, isActive }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string>('');
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const requestRef = useRef<number>(0);

  // Smoothing variables
  const lastX = useRef(0.5);
  const lastY = useRef(0.5);

  useEffect(() => {
    if (!isActive) return;

    const initMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );
        
        landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });
        
        setIsLoaded(true);
        startCamera();
      } catch (err) {
        console.error("MediaPipe Error:", err);
        setError("Failed to load hand tracking model.");
      }
    };

    initMediaPipe();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      cancelAnimationFrame(requestRef.current);
      if (landmarkerRef.current) landmarkerRef.current.close();
    };
  }, [isActive]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 1280, 
          height: 720,
          facingMode: "user" 
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener('loadeddata', predictWebcam);
      }
    } catch (err) {
      setError("Camera permission denied or not available.");
    }
  };

  const predictWebcam = () => {
    if (!landmarkerRef.current || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Resize canvas to match video (essential for mapping)
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    const startTimeMs = performance.now();
    const results = landmarkerRef.current.detectForVideo(video, startTimeMs);

    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // We need to mirror the drawing context to match the CSS mirrored video
      ctx.save();
      ctx.scale(-1, 1);
      ctx.translate(-canvas.width, 0);

      if (results.landmarks && results.landmarks.length > 0) {
        const landmarks = results.landmarks[0];
        
        // Key Landmarks
        // 4 = Thumb Tip, 8 = Index Tip
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];

        // Draw Landmarks
        ctx.fillStyle = "#FF69B4";
        for (const point of landmarks) {
          ctx.beginPath();
          ctx.arc(point.x * canvas.width, point.y * canvas.height, 4, 0, 2 * Math.PI);
          ctx.fill();
        }

        // Connect Hand (Simple skeleton)
        // ... (can add full connection logic here if needed, keeping it simple for perf)
        
        // Draw Pinch Line
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(thumbTip.x * canvas.width, thumbTip.y * canvas.height);
        ctx.lineTo(indexTip.x * canvas.width, indexTip.y * canvas.height);
        ctx.stroke();

        // --- GESTURE LOGIC ---
        
        // 1. Calculate Euclidean Distance (normalized 0-1)
        // Adjust for aspect ratio if needed, but raw is usually fine for pinch detection
        const distance = Math.sqrt(
          Math.pow(thumbTip.x - indexTip.x, 2) + 
          Math.pow(thumbTip.y - indexTip.y, 2)
        );

        // 2. Determine Pinch State (Threshold ~0.05 seems good for normalized coords)
        const isPinching = distance < 0.08;

        // 3. Calculate Center Point (Cursor Position)
        const rawX = (thumbTip.x + indexTip.x) / 2;
        const rawY = (thumbTip.y + indexTip.y) / 2;

        // 4. Mirror and Smooth Coordinates for UI
        // Raw X is from video (0 is right, 1 is left because of mirror). 
        // We want 0 left, 1 right for screen mapping.
        const targetX = 1 - rawX; 
        const targetY = rawY;

        // Lerp for smoothing (0.2 factor)
        lastX.current = lastX.current + (targetX - lastX.current) * 0.2;
        lastY.current = lastY.current + (targetY - lastY.current) * 0.2;

        onHandUpdate(lastX.current, lastY.current, isPinching);

        // Visual Feedback on Canvas
        ctx.beginPath();
        ctx.arc(rawX * canvas.width, rawY * canvas.height, isPinching ? 15 : 8, 0, 2 * Math.PI);
        ctx.fillStyle = isPinching ? "#00FF00" : "yellow";
        ctx.fill();
      } else {
          // No hand detected
          onHandUpdate(0.5, 0.5, false); // Reset to center-ish or handle gracefully
      }
      ctx.restore();
    }

    requestRef.current = requestAnimationFrame(predictWebcam);
  };

  return (
    <div className="absolute inset-0 -z-10 bg-black overflow-hidden pointer-events-none">
      {/* Video Feed - Mirrored */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover opacity-60 scale-x-[-1]"
      />
      {/* Debug/Overlay Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover scale-x-[-1]" // Canvas must also be mirrored via CSS to match video visual
      />
      
      {!isLoaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center text-white">
           <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              <p className="text-xs uppercase tracking-widest font-bold">Initializing Magic Vision...</p>
           </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-rose-500 bg-black/80">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default HandTracker;
