"use client";

import { useState } from "react";
import FingerDetection from "../components/fingerDetection";
import FingerGuide from "../components/fingerGuide";
import Keyboard from "../components/keyboard";

export enum FingerId {
  LeftPinky = 0,
  LeftRing,
  LeftMiddle,
  LeftIndex,
  LeftThumb,
  RightThumb,
  RightIndex,
  RightMiddle,
  RightRing,
  RightPinky,
}

export interface Finger {
  id: FingerId;
  fingerType: "pinky" | "ring" | "middle" | "index" | "thumb";
  keys: string[];
}

export interface Hand {
  side: "left" | "right";
  fingers: Finger[];
}

export const LeftHand: Hand = {
  side: "left",
  fingers: [
    { id: FingerId.LeftPinky, fingerType: "pinky", keys: ["q", "a", "z"] },
    { id: FingerId.LeftRing, fingerType: "ring", keys: ["w", "s", "x"] },
    { id: FingerId.LeftMiddle, fingerType: "middle", keys: ["e", "d", "c"] },
    { id: FingerId.LeftIndex, fingerType: "index", keys: ["r", "f", "v", "t", "g", "b"] },
    { id: FingerId.LeftThumb, fingerType: "thumb", keys: [" "] },
  ],
};

export const RightHand: Hand = {
  side: "right",
  fingers: [
    { id: FingerId.RightThumb, fingerType: "thumb", keys: [] },
    { id: FingerId.RightIndex, fingerType: "index", keys: ["y", "h", "n", "u", "j", "m"] },
    { id: FingerId.RightMiddle, fingerType: "middle", keys: ["i", "k", ","] },
    { id: FingerId.RightRing, fingerType: "ring", keys: ["o", "l", "."] },
    { id: FingerId.RightPinky, fingerType: "pinky", keys: ["p", ";", "/"] },
  ],
};

const hands = [LeftHand, RightHand];

// 定義に従って キー → 指 のマッピングを動的に生成
const key2fingerId: { [key: string]: FingerId } = {};

for (const hand of hands) {
  for (const finger of hand.fingers) {
    for (const key of finger.keys) {
      key2fingerId[key] = finger.id;
    }
  }
}

const promptTexts = ["the quick brown fox", "jumps over", "the lazy dog."];

// dummy
const keyRange = {
  // 省略
  t: { x: [0.3583, 0.3987], y: [0.2319, 0.3008] },
};

const generateHighlightedPromptText = (prompt: string, currentIndex: number, wrongKey: string | null) => {
  return (
    <span>
      {Array.from(prompt).map((char, index) => {
        if (char === " ") {
          char = "␣"; // 可視化されたスペース
        }

        if (index < currentIndex) {
          return (
            <span className="text-gray-400" key={index}>
              {char}
            </span>
          );
        }

        if (index === currentIndex) {
          return (
            <span className={wrongKey !== null ? "text-red-400" : "text-green-400"} key={index}>
              {char}
            </span>
          );
        }

        return char;
      })}
    </span>
  );
};

const isInRange = (coordinate: { x: number; y: number }, range: { x: [number, number]; y: [number, number] }) => {
  //dummy
  return (
    range.x[0] < coordinate.x && coordinate.x < range.x[1] && range.y[0] < coordinate.y && coordinate.y < range.y[1]
  );
};

export default function Game() {
  // お題
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentPrompt = promptTexts[currentPromptIndex];

  // ゲームの状態
  const [hasDone, setHasDone] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // 間違えたキーと指
  const [wrongKey, setWrongKey] = useState(null);
  const [wrongFingerId, setWrongFingerId] = useState(null);

  // 指の座標
  const [fingerCoordinates, setFingerCoordinates] = useState(null);

  const handleKeyPress = (e) => {
    // ゲームが始まっていない場合は、ゲームを始める
    if (!hasStarted) {
      setHasStarted(true);
      return;
    } else if (hasDone) {
      return;
    }
    console.log(fingerCoordinates);

    if (fingerCoordinates) {
      // null や undefined でないことを確認
      for (let fingerId in fingerCoordinates) {
        const fingerCoordinate = fingerCoordinates[fingerId];

        if (!fingerCoordinate) {
          continue;
        }

        // 違う指で押していたら入力を無視
        if (isInRange(fingerCoordinate, nextKeyRange)) {
          if (key2fingerId[e.key] !== Number(fingerId)) {
            setWrongFingerId(Number(fingerId));
            return;
          }
        }
      }
    }

    if (e.key === nextKey) {
      setWrongKey(null);
      setWrongFingerId(null);
      const newCurrentIndex = currentIndex + 1;
      setCurrentIndex(newCurrentIndex);

      // 次のお題に移る
      if (newCurrentIndex === currentPrompt.length) {
        setCurrentIndex(0);
        if (currentPromptIndex + 1 === promptTexts.length) {
          setHasDone(true);
        } else {
          setCurrentPromptIndex((prevIndex) => prevIndex + 1);
        }
      }
    } else {
      setWrongKey(e.key);
    }
  };

  // 開始前と終了後はキーを表示しない
  const nextKey = hasStarted && !hasDone ? promptTexts[currentPromptIndex][currentIndex] : null;
  const nextKeyRange = nextKey ? keyRange[nextKey] : null;
  const nextFingerId = nextKey ? key2fingerId[nextKey] : null;

  return (
    <>
      <div className="flex flex-col justify-center items-center h-screen" onKeyDown={handleKeyPress} tabIndex={0}>
        <>
          <p className="mb-5">
            Sentences：{currentPromptIndex + 1} / {promptTexts.length}
          </p>

          <div>
            <p className="text-3xl mb-5">
              {hasDone
                ? "Done!"
                : hasStarted
                ? generateHighlightedPromptText(currentPrompt, currentIndex, wrongKey)
                : "Press any key to start"}
            </p>
          </div>
        </>
        <Keyboard nextKey={nextKey} wrongKey={wrongKey} />
        <FingerGuide nextFingerId={nextFingerId} wrongFingerId={wrongFingerId} />
        <FingerDetection setFingerCoordinates={setFingerCoordinates} />
      </div>
    </>
  );
}
