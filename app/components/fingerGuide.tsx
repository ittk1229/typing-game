import { FingerId, Hand, LeftHand, RightHand } from "../game/page";
import styles from "./fingerGuide.module.css";

interface HandProps {
  hand: Hand;
  nextFingerId: FingerId | null;
  wrongFingerId: FingerId | null;
}

// 片手を描画
const Hand = ({ hand, nextFingerId, wrongFingerId }: HandProps) => {
  return (
    <div className={`${styles.hand}`}>
      {hand.fingers.map((finger) => {
        const isNextFinger = finger.id === nextFingerId;
        const isWrongFinger = finger.id === wrongFingerId;
        const fingerClassName = isNextFinger ? styles.nextFinger : isWrongFinger ? styles.wrongFinger : "";
        return (
          <div key={finger.id} className={`${styles.finger} ${styles[finger.fingerType]} ${fingerClassName}`}></div>
        );
      })}
    </div>
  );
};

// 指のガイドを描画
interface FingerGuideProps {
  nextFingerId: FingerId | null;
  wrongFingerId: FingerId | null;
}

const FingerGuide = (props: FingerGuideProps) => {
  return (
    <div className="flex justify-center mt-4">
      <Hand hand={LeftHand} {...props} />
      <Hand hand={RightHand} {...props} />
    </div>
  );
};

export default FingerGuide;
