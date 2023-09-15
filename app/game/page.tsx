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
const key2position = localStorage.getItem("key2position") ? JSON.parse(localStorage.getItem("key2position")) : {};
console.log(key2position);

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

type Point = { x: number; y: number };

const dist_square = (point1: Point, point2: Point): number => {
  return (point1.x - point2.x) ** 2 + (point1.y - point2.y) ** 2;
};

const get_nearest_finger = (key2position, fingerCoordinates, key) => {
  let min_dist = 1000;
  let nearest_finger = null;
  for (let fingerId in fingerCoordinates) {
    const fingerCoordinate = fingerCoordinates[fingerId];
    if (!fingerCoordinate) {
      continue;
    }
    if (min_dist > dist_square(fingerCoordinate, key2position[key])) {
      min_dist = dist_square(fingerCoordinate, key2position[key]);
      nearest_finger = fingerId;
    }
  }
  return nearest_finger;
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

    if (fingerCoordinates && nextKey !== " " && key2position[e.key]) {
      const nearest_finger = get_nearest_finger(key2position, fingerCoordinates, e.key);
      if (key2fingerId[e.key] !== Number(nearest_finger)) {
        setWrongFingerId(Number(nearest_finger));
        return;
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
