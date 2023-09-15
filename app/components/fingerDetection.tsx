import { Camera } from "@mediapipe/camera_utils";
import { Hands, Results } from "@mediapipe/hands";
import { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { FingerId } from "../game/page";
import { drawCanvas } from "../utils/drawCanvas";

const FingerDetection = ({ setFingerCoordinates }) => {
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

  const onResults = useCallback(
    (newResults: Results) => {
      setResults(newResults);
      const canvasCtx = canvasRef.current?.getContext("2d");
      if (canvasCtx) {
        drawCanvas(canvasCtx, newResults);
      }

      // Initialize fingerCoordinates with null values
      const fingerCoordinates = {
        [FingerId.LeftPinky]: null,
        [FingerId.LeftRing]: null,
        [FingerId.LeftMiddle]: null,
        [FingerId.LeftIndex]: null,
        [FingerId.LeftThumb]: null,
        [FingerId.RightThumb]: null,
        [FingerId.RightIndex]: null,
        [FingerId.RightMiddle]: null,
        [FingerId.RightRing]: null,
        [FingerId.RightPinky]: null,
      };

      // Update fingerCoordinates with detected values
      newResults.multiHandLandmarks?.forEach((hand, index) => {
        // 逆...
        const isLeftHand = newResults.multiHandedness[index].label === "Right";
        fingerCoordinates[isLeftHand ? FingerId.LeftThumb : FingerId.RightThumb] = { x: hand[4].x, y: hand[4].y };
        fingerCoordinates[isLeftHand ? FingerId.LeftIndex : FingerId.RightIndex] = { x: hand[8].x, y: hand[8].y };
        fingerCoordinates[isLeftHand ? FingerId.LeftMiddle : FingerId.RightMiddle] = { x: hand[12].x, y: hand[12].y };
        fingerCoordinates[isLeftHand ? FingerId.LeftRing : FingerId.RightRing] = { x: hand[16].x, y: hand[16].y };
        fingerCoordinates[isLeftHand ? FingerId.LeftPinky : FingerId.RightPinky] = { x: hand[20].x, y: hand[20].y };
      });

      // Pass the coordinates to the parent component
      setFingerCoordinates(fingerCoordinates);
    },
    [setFingerCoordinates]
  );

  useEffect(() => {
    const hands = initializeHands();

    if (webcamRef.current) {
      const camera = new Camera(webcamRef.current.video!, {
        onFrame: async () => {
          try {
            await hands.send({ image: webcamRef.current!.video! });
          } catch (error) {
            console.error("Failed to send image:", error);
          }
        },
        width: 640,
        height: 360,
      });

      try {
        camera.start();
      } catch (error) {
        console.error("Failed to start camera:", error);
      }
    }

    return () => {
      hands.close();
      // Add any additional cleanup logic here if needed
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

export default FingerDetection;
