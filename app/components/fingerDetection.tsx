import { Camera } from "@mediapipe/camera_utils";
import { Hands, Results } from "@mediapipe/hands";
import { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { drawCanvas } from "../utils/drawCanvas";

const App = () => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [results, setResults] = useState<Results | null>(null);

  const initializeHands = () => {
    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    hands.onResults(onResults);
    return hands;
  };

  const onResults = useCallback((newResults: Results) => {
    setResults(newResults);
    const canvasCtx = canvasRef.current?.getContext("2d");
    if (canvasCtx) {
      drawCanvas(canvasCtx, newResults);
    }
  }, []);

  useEffect(() => {
    const hands = initializeHands();

    if (webcamRef.current) {
      const camera = new Camera(webcamRef.current.video!, {
        onFrame: () => hands.send({ image: webcamRef.current!.video! }),
        width: 640,
        height: 360,
      });
      camera.start();
    }

    // Cleanup function
    return () => {
      hands?.close();
    };
  }, [onResults]);

  return (
    <div>
      <Webcam
        audio={false}
        style={{ display: "none" }}
        width={640}
        height={360}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={{ width: 640, height: 360, facingMode: "user" }}
      />
      <canvas ref={canvasRef} width={640} height={360} />
    </div>
  );
};

export default App;
