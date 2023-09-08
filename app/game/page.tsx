"use client";

import { useState } from "react";
import FingerGuide from "../components/fingerGuide";
import Keyboard from "../components/keyboard";

export default function Game() {
  const promptTexts = ["the quick brown fox", "jumps over", "the lazy dog."];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [wrongKey, setWrongKey] = useState(null);

  const handleKeyPress = (e) => {
    const currentPrompt = promptTexts[currentPromptIndex];

    if (e.key === currentPrompt[currentIndex]) {
      setWrongKey(null);
      const newCurrentIndex = currentIndex + 1;
      setCurrentIndex(newCurrentIndex);

      if (newCurrentIndex === currentPrompt.length) {
        setCurrentIndex(0);
        if (currentPromptIndex + 1 === promptTexts.length) {
          setIsDone(true);
        } else {
          setCurrentPromptIndex((prevIndex) => prevIndex + 1);
        }
      }
    } else {
      setWrongKey(e.key);
    }
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

  const nextKey = promptTexts[currentPromptIndex][currentIndex];

  return (
    <>
      <div className="flex flex-col justify-center items-center h-screen" onKeyDown={handleKeyPress} tabIndex="0">
        {/*<p>タイピングゲーム</p>*/}

        <p className="mb-5">
          現在のお題：{currentPromptIndex + 1} / {promptTexts.length}
        </p>

        <div>
          <p className="text-3xl mb-5">{isDone ? "Done!" : highlightedPromptText}</p>
        </div>

        <Keyboard nextKey={nextKey} wrongKey={wrongKey} />
        <FingerGuide nextKey={nextKey} />
      </div>
    </>
  );
}
