import { useEffect } from "react";

const FingerDetection = () => {
  useEffect(() => {
    const initHandLandmarker = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      const handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "hand_landmarker.task",
        },
        numHands: 2,
      });

      await handLandmarker.setOptions({ runningMode: "video" });

      let lastVideoTime = -1;

      const renderLoop = () => {
        const video = document.getElementById("video");

        if (video.currentTime !== lastVideoTime) {
          const detections = handLandmarker.detectForVideo(video);
          processResults(detections);
          lastVideoTime = video.currentTime;
        }

        requestAnimationFrame(() => {
          renderLoop();
        });
      };

      renderLoop();
    };

    initHandLandmarker();
  }, []);

  return (
    <div>
      <p>Finger Detection</p>
      <video id="video" width="200" height="200" autoPlay></video>
    </div>
  );
};

export default FingerDetection;
