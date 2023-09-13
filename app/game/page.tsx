"use client";

import { useState } from "react";
import FingerDetection from "../components/fingerDetection";
import FingerGuide from "../components/fingerGuide";
import Keyboard from "../components/keyboard";

export default function Game() {
  // お題
  const promptTexts = ["the quick brown fox", "jumps over", "the lazy dog."];
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  // ゲームの状態
  const [hasDone, setHasDone] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // 間違えたキー
  const [wrongKey, setWrongKey] = useState(null);

  // 指の座標
  const [fingerCorrdinates, setFingerCoordinates] = useState(null);

  const handleKeyPress = (e) => {
    // ゲームが始まっていない場合は、ゲームを始める
    if (!hasStarted) {
      setHasStarted(true);
      return;
    } else if (hasDone) {
      return;
    }

    // e をキーとしてxとｙの範囲を返す辞書を作成しておく
    // 最初はキーによらず定数， 0< x < 0.5, 0 < y < 0.5 とかでもいいかも
    // 該当の範囲にどの指があるかを確認する
    // 打つべき指が範囲にアレば緑，なければ誤って範囲に入ってしまった指を赤に
    // fingerGuide からもってくるか
    // nextkey ではなく nextfingerid を渡すようにすれば良い

    const currentPrompt = promptTexts[currentPromptIndex];

    if (e.key === currentPrompt[currentIndex]) {
      setWrongKey(null);
      const newCurrentIndex = currentIndex + 1;
      setCurrentIndex(newCurrentIndex);

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

    console.log("FingerCorrdinates: ", fingerCorrdinates);
  };

  const highlightedPromptText = (
    <span>
      {Array.from(promptTexts[currentPromptIndex]).map((char, index) => {
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

  // 開始前と終了後はキーを表示しない
  const nextKey = hasStarted && !hasDone ? promptTexts[currentPromptIndex][currentIndex] : null;

  return (
    <>
      <div className="flex flex-col justify-center items-center h-screen" onKeyDown={handleKeyPress} tabIndex="0">
        <>
          <p className="mb-5">
            Sentences：{currentPromptIndex + 1} / {promptTexts.length}
          </p>

          <div>
            <p className="text-3xl mb-5">
              {hasDone ? "Done!" : hasStarted ? highlightedPromptText : "Press any key to start"}
            </p>
          </div>
        </>
        <Keyboard nextKey={nextKey} wrongKey={wrongKey} />
        <FingerGuide nextKey={nextKey} />
        <FingerDetection setFingerCoordinates={setFingerCoordinates} />
      </div>
    </>
  );
}
