import styles from "./fingerGuide.module.css";

const FingerGuide = ({ nextKey }) => {
  // 0~4: 左手の小指から親指
  // 5~9: 右手の親指から小指
  const fingerMapping = {
    q: 0,
    a: 0,
    z: 0,
    w: 1,
    s: 1,
    x: 1,
    e: 2,
    d: 2,
    c: 2,
    r: 3,
    f: 3,
    v: 3,
    t: 3,
    g: 3,
    b: 3,
    y: 6,
    h: 6,
    n: 6,
    u: 6,
    j: 6,
    m: 6,
    i: 7,
    k: 7,
    ",": 7,
    o: 8,
    l: 8,
    ".": 8,
    p: 9,
    "@": 9,
    ";": 9,
    " ": 4,
  };

  const nextFinger = fingerMapping[nextKey];

  return (
    <div className="flex justify-center mt-4">
      {Array.from({ length: 10 }).map((_, index) => (
        <div
          key={index}
          className={`${index === 4 || index === 5 ? styles.thumb : styles.finger} ${
            index === nextFinger ? styles.nextFinger : ""
          }`}
        >
          {index + 1}
        </div>
      ))}
    </div>
  );
};

export default FingerGuide;
