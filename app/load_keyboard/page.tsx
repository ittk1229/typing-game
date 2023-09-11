"use client";
import Link from "next/link";
import { useEffect } from "react";

export default function LoadKeyboard() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "/opencv.js";
    script.async = true;
    script.onload = () => {
      cv.onRuntimeInitialized = () => {
        console.log("OpenCV Ready");

        // ウェブカメラのビデオストリームを取得して表示
        navigator.mediaDevices
          .getUserMedia({ video: true })
          .then((stream) => {
            const video = document.getElementById("videoInput");
            video.srcObject = stream;
            video.play();

            // Video metadata is loaded, now we can fetch its width and height.
            video.onloadedmetadata = () => {
              // Update canvas size to match video resolution.
              const outputCanvas = document.getElementById("outputCanvas");
              outputCanvas.width = video.videoWidth;
              outputCanvas.height = video.videoHeight;

              // ビデオフレームの処理を開始（リアルタイムで処理する場合）
              processVideo(video);
            };
          })
          .catch((err) => console.error(err));
      };
    };
    document.body.appendChild(script);
  }, []);

  const processVideo = (video) => {
    const outputCanvas = document.getElementById("outputCanvas");
    const cap = new cv.VideoCapture(video);
    const dst = new cv.Mat(video.height, video.width, cv.CV_8UC4); // ここを修正
    const gray = new cv.Mat(video.height, video.width, cv.CV_8UC1); // グレースケール用のマットを作成

    const processFrame = () => {
      cap.read(dst);
      cv.cvtColor(dst, gray, cv.COLOR_RGBA2GRAY); // グレースケールに変換
      cv.imshow("outputCanvas", gray); // グレースケール画像を表示

      requestAnimationFrame(processFrame);
    };

    requestAnimationFrame(processFrame);
  };

  return (
    <>
      <p>キーボードを読み込むためのページです</p>
      <Link href={"/"}>ホームに戻る</Link>
      <video id="videoInput" width="200" height="200" autoPlay></video>
      <canvas id="outputCanvas" width="200" height="200"></canvas>
    </>
  );
}
