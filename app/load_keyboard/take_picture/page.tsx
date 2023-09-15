"use client";
import Link from "next/link";
// ImageだとHTMLImageElementになってしまうので、NextImageを使用する
// https://stackoverflow.com/questions/67645676/new-image-in-next-js
import NextImage from "next/image";
import cv from "opencv-ts";
import { useCallback, useEffect, useRef, useState, createContext } from "react";
// key_datas.tsxのrefをそのまま使います。{}を取り除きました。
// https://zenn.dev/hirof1990/scraps/a0ac0ea372cf02
import inputImageRef from "../../components/key_datas";
// react-webcamを使用してカメラを呼び出す
import Webcam from "react-webcam";
// セレクトボックスを用意
// 参考:https://dev.classmethod.jp/articles/react-select/
import Select from "react-select";
// assert文が使いたかっただけ
import assert from "assert";
// 全てAndを取ることで、全ての座標が取得できたかを判定する
const finishFlag = {
  one: false,
  z: false,
  ques: false,
  zero: false,
};
const options = [
  { value: "1", label: finishFlag.one ? "1(OK)" : "1" },
  { value: "z", label: finishFlag.z ? "z(OK)" : "z" },
  { value: "?", label: finishFlag.ques ? "?(OK)" : "?" },
  { value: "0", label: finishFlag.zero ? "0(OK)" : "0" },
];
const colors = {
  red: new cv.Scalar(0, 0, 255, 255),
  orange: new cv.Scalar(0, 165, 255, 255),
  yellow: new cv.Scalar(0, 255, 255, 255),
  lightGreen: new cv.Scalar(0, 255, 0, 255),
  green: new cv.Scalar(255, 255, 0, 255),
  lightBlue: new cv.Scalar(255, 0, 0, 255),
  blue: new cv.Scalar(255, 0, 165, 255),
  purple: new cv.Scalar(255, 0, 255, 255),
}
let nowState = "1";
// inputImageRefの使い方がわかんない
const onClickImage = (evt: React.MouseEvent<HTMLImageElement>) => {
  // https://qiita.com/AtsushiEsashika/items/1ba3d078a88c3255760b
  switch (nowState) {
    // useRefなら
    // case "1":
    //   if(inputImageRef.current?.one){
    //     inputImageRef.current.one.x = evt.nativeEvent.offsetX; // offsetXは型を直したら出てきた
    //     inputImageRef.current.one.y = evt.nativeEvent.offsetY;
    //   }
    //   break;
    // みたいに書く(変えたが)
    case "1":
      inputImageRef.one.x = evt.nativeEvent.offsetX;
      inputImageRef.one.y = evt.nativeEvent.offsetY;
      finishFlag.one = true;
      // alert(nowState);
      // alert(inputImageRef.one.x);
      // alert(inputImageRef.one.y);
      break;
    case "z":
      inputImageRef.z.x = evt.nativeEvent.offsetX;
      inputImageRef.z.y = evt.nativeEvent.offsetY;
      finishFlag.z = true;
      break;
    case "?":
      inputImageRef.ques.x = evt.nativeEvent.offsetX;
      inputImageRef.ques.y = evt.nativeEvent.offsetY;
      finishFlag.ques = true;
      break;
    case "0":
      inputImageRef.zero.x = evt.nativeEvent.offsetX;
      inputImageRef.zero.y = evt.nativeEvent.offsetY;
      finishFlag.zero = true;
      break;
    default:
      // 想定していない
      assert(false);
  }
};
// 解像度は実際の処理に合わせて変更希望
const videoConstraints = {
  width: 1920,
  height: 1080,
};
// ページ
const CameraComponent = () => {
  // Step1
  const webcamRef = useRef<Webcam>(null);
  const [url, setUrl] = useState<string | null>(null);
  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setUrl(imageSrc);
    }
  }, [webcamRef]);
  // Step2
  const [selectedOption, setSelectedOption] = useState(options[0]);
  // Step3
  const drawCircles = () => {
    // 元の画像を取得 -> 画像に丸を描画していく
    let image = new Image();
    if(url) image.src = url;
    let imageMat = cv.imread(image);
    // 半径を算出
    const r = Math.sqrt(Math.abs(inputImageRef.one.x - inputImageRef.z.x)**2 + Math.abs(inputImageRef.one.y - inputImageRef.z.y)**2)/4/2;
    // 丸を描画
    for(let i = 0; i < 10; i++){
      let drawColor;
      switch(i){
        case 1:
          drawColor = colors.red;
          break;
        case 2:
          drawColor = colors.orange;
          break;
        case 3:
          drawColor = colors.yellow;
          break;
        case 4:
          drawColor = colors.yellow;
          break;
        case 5:
          drawColor = colors.lightGreen;
          break;
        case 6:
          drawColor = colors.lightGreen;
          break;
        case 7:
          drawColor = colors.green;
          break;
        case 8:
          drawColor = colors.lightBlue;
          break;
        case 9:
          drawColor = colors.blue;
          break;
        case 0:
          drawColor = colors.purple;
          break;
        default:
          assert(false);
      }
      const origin  = new cv.Point(inputImageRef.one.x, inputImageRef.one.y);
      const vectorU = new cv.Point((inputImageRef.z.x - inputImageRef.one.x) / 3, (inputImageRef.z.y - inputImageRef.one.y) / 3);
      const vectorV = new cv.Point((inputImageRef.zero.x - inputImageRef.one.x) / 9, (inputImageRef.zero.y - inputImageRef.one.y) / 9);
      for(let j = 0; j < 4; j++){
        const drawPoint = new cv.Point(origin.x + vectorU.x * j + vectorV.x * i, origin.y + vectorU.y * j + vectorV.y * i);
        cv.circle(imageMat,drawPoint,r,drawColor,2);
      }
    }
    cv.imshow('keyboard', imageMat);
  };
  return (
    <div>
      <Link href={"/"}>ホームに戻る</Link>
      {/* Step1 キーボードの撮影 */}
      <p>まずは、キーボードを撮影してください。</p>
      <Webcam
        audio={false}
        width={videoConstraints.width}
        height={videoConstraints.height}
        ref={webcamRef}
        screenshotFormat="image/png"
        videoConstraints={videoConstraints}
      />
      <button onClick={capture}>キーボードを撮影する</button>
      {/* Step2 位置合わせ */}
      {url && (
        <div>
          <p>
            次に、画像をクリックして、キーボード(1,Z,?,0)の位置を指定して下さい。
          </p>
          <NextImage
            src={url}
            onClick={onClickImage}
            alt="taken keyboard"
            width={videoConstraints.width}
            height={videoConstraints.height}
          />
          <Select
            options={options}
            defaultValue={selectedOption}
            onChange={(value) => {
              if (value) {
                setSelectedOption(value);
                nowState = value.value;
              } else {
                null;
              }
            }}
          />
        </div>
      )}
      {/* Step3 結果を確認(OpenCV.jsで結果を描画する) */}
      {
        (finishFlag.one && finishFlag.z && finishFlag.ques && finishFlag.zero) &&
        <div>
          <p>キーボードの位置を確認してください。もしこれでよければトップに戻ってください。</p>
          <button onClick={drawCircles}>キーボードの位置を確認する</button>
          <canvas id="keyboard"/>
          <Link href={"/"}>ホームに戻る(これでOK)</Link>
        </div>
      }
    </div>
  );
};

export default CameraComponent;
