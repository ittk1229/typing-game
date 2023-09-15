"use client";
import Link from "next/link";
// ImageだとHTMLImageElementになってしまうので、NextImageを使用する
// https://stackoverflow.com/questions/67645676/new-image-in-next-js
import NextImage from "next/image";
import cv from "opencv-ts";
import { useCallback, useRef, useState } from "react";
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
import {rows} from "../../components/keyboard";

// 全てAndを取ることで、全ての座標が取得できたかを判定する
const finishFlag = {
  q: false,
  z: false,
  ques: false,
  p: false,
};

const options = [
  { value: "q", label: finishFlag.q ? "1(OK)" : "q" },
  { value: "z", label: finishFlag.z ? "z(OK)" : "z" },
  { value: "?", label: finishFlag.ques ? "?(OK)" : "?" },
  { value: "p", label: finishFlag.p ? "0(OK)" : "p" },
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
};

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
    case "q":
      inputImageRef.q.x = evt.nativeEvent.offsetX;
      inputImageRef.q.y = evt.nativeEvent.offsetY;
      finishFlag.q = true;
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
    case "p":
      inputImageRef.p.x = evt.nativeEvent.offsetX;
      inputImageRef.p.y = evt.nativeEvent.offsetY;
      finishFlag.p = true;
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

type Point = { x: number; y: number };

const normalize = (point: Point, width: number, height: number): Point => {
  return { x: point.x / width, y: point.y / height };
};

const mulObj = (point: Point, mul: number): Point => {
  return { x: point.x * mul, y: point.y * mul };
};

const addObj = (point1: Point, point2: Point): Point => {
  return { x: point1.x + point2.x, y: point1.y + point2.y };
};

const dist = (point1: Point, point2: Point): number => {
  return Math.sqrt((point1.x - point2.x) ** 2 + (point1.y - point2.y) ** 2);
};

const key2position = {};

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
    if (url) image.src = url;

    let imageMat = cv.imread(image);
    // console.log(imageMat.cols, imageMat.rows);

    // Initialize positions
    const positions: Point[][] = Array.from({ length: 3 }, () =>
      Array.from({ length: 10 }, () => ({ x: 0.0, y: 0.0 }))
    );

    // Set corner points
    positions[0][0] = inputImageRef.q;
    positions[2][0] = inputImageRef.z;
    positions[2][9] = inputImageRef.ques;
    positions[0][9] = inputImageRef.p;

    {
      const dist_q_z = dist(inputImageRef.q, inputImageRef.z);
      const dist_p_ques = dist(inputImageRef.p, inputImageRef.ques);
      const ratio_sum = (dist_q_z + dist_p_ques) / 2 * 9;
      let ratio = 0;
      // Fill in the remaining points for rows 0 and 2
      for (let i = 1; i < 9; i++) {
        ratio += (dist_q_z + (dist_p_ques - dist_q_z) * ((i - 1) / 8));
        const normalized_ratio = ratio / ratio_sum;
        positions[0][i] = addObj(mulObj(positions[0][0], 1 - normalized_ratio), mulObj(positions[0][9], normalized_ratio));
        positions[2][i] = addObj(mulObj(positions[2][0], 1 - normalized_ratio), mulObj(positions[2][9], normalized_ratio));
      }
    }

    // Calculate row 1
    for (let i = 0; i < 10; i++) {
      positions[1][i] = mulObj(addObj(positions[0][i], positions[2][i]), 1 / 2);
    }

    // 半径を算出
    const r = dist(inputImageRef.q, inputImageRef.z) / 4 / 2;

    // 丸を描画
    for (let i = 0; i < 10; i++) {
      let drawColor;
      switch (i) {
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

      for (let j = 0; j < 3; j++) {
        const nx = positions[j][i].x;
        const ny = positions[j][i].y;
        const drawPoint = new cv.Point(nx, ny);
        key2position[rows[j][i]] = { x: nx/imageMat.cols, y: ny/imageMat.rows };
        cv.circle(imageMat, drawPoint, r, drawColor, 2);
      }
    }

    localStorage.setItem("key2position", JSON.stringify(key2position));
    cv.imshow("keyboard", imageMat);
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
          <p>次に、画像をクリックして、キーボード(Q,Z,?,P)の位置を指定して下さい。</p>
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
      {finishFlag.q && finishFlag.z && finishFlag.ques && finishFlag.p && (
        <div>
          <p>キーボードの位置を確認してください。もしこれでよければトップに戻ってください。</p>
          <button onClick={drawCircles}>キーボードの位置を確認する</button>
          <canvas id="keyboard" />
          <Link href={"/"}>ホームに戻る(これでOK)</Link>
        </div>
      )}
    </div>
  );
};

export default CameraComponent;
