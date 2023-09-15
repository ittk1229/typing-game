// import React ,{useRef} from "react";
// useRefにするとHook関連でエラーが出るので、普通の変数にしました。整合性が取れているかわからないので、後で合わせたいです。
type coordinate = {
  x: number,
  y: number,
}
// get_key_pos.pyに合わせる
type keyData = {
  one: coordinate,
  z: coordinate,
  ques: coordinate,
  zero: coordinate,
}
// const inputImageRef = useRef<keyData | null>(null);
let inputImageRef: keyData = {one: {x: 0, y: 0}, z: {x: 0, y: 0}, ques: {x: 0, y: 0}, zero: {x: 0, y: 0}};
export default inputImageRef;