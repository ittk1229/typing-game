import Link from "next/link";

export default function LoadKeyboard() {
  return (
    <>
      <p>キーボードを読み込むためのページです</p>
      <Link href={"/"}>
        ホームに戻る
      </Link>
    </>
  );
}
