import React, { useRef, useState, useEffect } from "react";
import "../../css/matching/Card2.css";

/** 데모 데이터 */
const candidates = [
  { id: 1, name: "정민",   major: "항공소프트웨어공학과", msg: "반갑습니다", img: "/images/panda.png" },
  { id: 2, name: "정재민", major: "항공소프트웨어공학과", msg: "안녕하세요", img: "/images/dog.png" },
  { id: 3, name: "종민",   major: "항공소프트웨어공학과", msg: "좋은 하루!", img: "/images/cat.png"  },
];

const rem = (r) => r * 16;                    // 1rem = 16px
const wrap = (i, n) => (i + n) % n;

export default function Card2() {
  const N = candidates.length;

  // 시작 상태: 1 - "2" - 3
  const [center, setCenter] = useState(1);
  const centerRef = useRef(center);
  useEffect(() => { centerRef.current = center; }, [center]);

  const [dx, setDx] = useState(0);            // 드래그 누적 이동(px). 항상 (-SPREAD, +SPREAD) 범위
  const [snapping, setSnapping] = useState(false);
  const [dir, setDir] = useState("");         // "dir-left" | "dir-right" | ""

  const dragging = useRef(false);
  const lastX = useRef(0);

  // 레이아웃 (모바일 기준)
  const CARD_W = rem(13);      // 카드 폭
  const GAP    = rem(1.5);     // 카드 간격
  const SPREAD = CARD_W + GAP; // 슬롯 간 간격
  const SNAP_MS = 260;         // 스냅 시간 (CSS와 동일)

  // 드래그 시작
  const onStart = (x) => {
    dragging.current = true;
    setSnapping(false);
    setDir("");
    lastX.current = x;
  };

  const MAX_DRAG = CARD_W + GAP;   // = SPREAD

  // 드래그 중 (끊김 없는 무한 루프)
  // onMove (수정)
const onMove = (x) => {
  if (!dragging.current) return;
  const delta = x - lastX.current;
  lastX.current = x;

  // 드래그 중엔 center를 바꾸지 않는다!
  const nextDx = Math.max(-MAX_DRAG, Math.min(MAX_DRAG, dx + delta)); // clamp
  setDx(nextDx);
};

  // 방향별 완료 스냅(한 칸 이동 애니메이션 → 인덱스 갱신 → 0으로 리셋)
  const completeSlide = (sign /* -1: 왼쪽으로, +1: 오른쪽으로 */) => {
    setSnapping(true);
    setDir(sign < 0 ? "dir-left" : "dir-right");
    setDx(sign * SPREAD);                         // 해당 방향으로 한 칸 끝까지 애니메이션
    window.setTimeout(() => {
      // 애니메이션 완료 후: 인덱스 갱신
      const nextCenter = sign < 0
        ? wrap(centerRef.current + 1, N)          // 왼쪽으로 넘김 → 오른쪽 카드가 중앙
        : wrap(centerRef.current - 1, N);         // 오른쪽으로 넘김 → 왼쪽 카드가 중앙

      centerRef.current = nextCenter;
      setCenter(nextCenter);

      // 점프 없이 새 기준(0)으로 즉시 리셋
      setSnapping(false);
      setDx(0);
      setDir("");
    }, SNAP_MS);
  };

  // onEnd (수정) — 한 번에 최대 1장
const onEnd = () => {
  if (!dragging.current) return;
  dragging.current = false;

  const absDx = Math.abs(dx);
  const sign = dx < 0 ? -1 : 1; // 방향

  if (absDx >= MAX_DRAG / 2) {
    // 딱 1장만 이동
    completeSlide(sign);   // 내부에서 center = wrap(center ± 1)
  } else {
    // 원위치
    setSnapping(true);
    setDx(0);
    setTimeout(() => setSnapping(false), SNAP_MS);
  }
};

  // 다섯 슬롯 위치: -2, -1, 0, +1, +2 (미리 렌더 → 가장자리에서 일찍 보임)
  const xFarLeft = -2 * SPREAD + dx;
  const xLeft    = -1 * SPREAD + dx;
  const xCenter  =  0 * SPREAD + dx;
  const xRight   = +1 * SPREAD + dx;
  const xFarRight= +2 * SPREAD + dx;

  // 다섯 장의 카드 인덱스(모듈러)
  const idxFarLeft  = wrap(center - 2, N);
  const idxLeft     = wrap(center - 1, N);
  const idxRight    = wrap(center + 1, N);
  const idxFarRight = wrap(center + 2, N);

  const CardBody = ({ item }) => (
    <>
      <div className="img-wrap"><img src={item.img} alt={item.name} /></div>
      <div className="info">
        <h3>{item.name}</h3>
        <p className="major">{item.major}</p>
        <p className="msg">“{item.msg}”</p>
      </div>
    </>
  );

  return (
    <>
      <div className="title">원하는 상대에게 플러팅하세요</div>

      <div className="card-root">
        <div
          className={`card-wrap ${snapping ? "snapping" : ""} ${dir}`}
          onTouchStart={(e) => onStart(e.touches[0].clientX)}
          onTouchMove={(e) => onMove(e.touches[0].clientX)}
          onTouchEnd={onEnd}
          onMouseDown={(e) => onStart(e.clientX)}
          onMouseMove={(e) => onMove(e.clientX)}
          onMouseUp={onEnd}
          onMouseLeave={onEnd}
        >
          {/* -2 슬롯 */}
          <div
            className="slot slot-far-left"
            style={{ transform: `translate(calc(-50% + ${xFarLeft}px), -50%)` }}
          >
            <div className="card"><CardBody item={candidates[idxFarLeft]} /></div>
          </div>

          {/* -1 슬롯 */}
          <div
            className="slot slot-left"
            style={{ transform: `translate(calc(-50% + ${xLeft}px), -50%)` }}
          >
            <div className="card"><CardBody item={candidates[idxLeft]} /></div>
          </div>

          {/* 0 슬롯 */}
          <div
            className="slot slot-center"
            style={{ transform: `translate(calc(-50% + ${xCenter}px), -50%)` }}
          >
            <div className="card"><CardBody item={candidates[center]} /></div>
          </div>

          {/* +1 슬롯 */}
          <div
            className="slot slot-right"
            style={{ transform: `translate(calc(-50% + ${xRight}px), -50%)` }}
          >
            <div className="card"><CardBody item={candidates[idxRight]} /></div>
          </div>

          {/* +2 슬롯 */}
          <div
            className="slot slot-far-right"
            style={{ transform: `translate(calc(-50% + ${xFarRight}px), -50%)` }}
          >
            <div className="card"><CardBody item={candidates[idxFarRight]} /></div>
          </div>
        </div>
      </div>
    </>
  );
}
