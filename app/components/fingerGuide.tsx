import styles from "./fingerGuide.module.css";

enum FingerId {
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

interface Finger {
  id: FingerId;
  fingerType: "pinky" | "ring" | "middle" | "index" | "thumb";
  keys: string[];
}

interface Hand {
  side: "left" | "right";
  fingers: Finger[];
}

const LeftHand: Hand = {
  side: "left",
  fingers: [
    { id: FingerId.LeftPinky, fingerType: "pinky", keys: ["q", "a", "z"] },
    { id: FingerId.LeftRing, fingerType: "ring", keys: ["w", "s", "x"] },
    { id: FingerId.LeftMiddle, fingerType: "middle", keys: ["e", "d", "c"] },
    { id: FingerId.LeftIndex, fingerType: "index", keys: ["r", "f", "v", "t", "g", "b"] },
    { id: FingerId.LeftThumb, fingerType: "thumb", keys: [" "] },
  ],
};

const RightHand: Hand = {
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

interface HandProps {
  hand: Hand;
  nextFingerId: FingerId | null;
}

// 片手を描画
const Hand = ({ hand, nextFingerId }: HandProps) => {
  return (
    <div className={`${styles.hand}`}>
      {hand.fingers.map((finger) => (
        <div
          key={finger.id}
          className={`${styles.finger} ${styles[finger.fingerType]} ${
            nextFingerId != null && finger.id == nextFingerId ? styles.nextFinger : ""
          }`}
        ></div>
      ))}
    </div>
  );
};

// 定義に従って キー → 指 のマッピングを動的に生成
const key2fingerId: { [key: string]: FingerId } = {};

for (const hand of hands) {
  for (const finger of hand.fingers) {
    for (const key of finger.keys) {
      key2fingerId[key] = finger.id;
    }
  }
}

// 指のガイドを描画
interface FingerGuideProps {
  nextKey: string | null;
}

const FingerGuide = ({ nextKey }: FingerGuideProps) => {
  const nextFingerId = nextKey ? key2fingerId[nextKey] : null;

  return (
    <div className="flex justify-center mt-4">
      <Hand hand={LeftHand} nextFingerId={nextFingerId} />
      <Hand hand={RightHand} nextFingerId={nextFingerId} />
    </div>
  );
};

export default FingerGuide;
