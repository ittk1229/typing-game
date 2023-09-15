import Link from "next/link";

export default function Home() {
  return (
    <>
      <Link href="/game" className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          遊ぶ
      </Link>

      <Link href="/load_keyboard/take_picture" className="inline-block bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ml-4">
          キーボードを読み込む
      </Link>
    </>
  );
}
