import React, { useRef, useState, useEffect } from "react";
import "../../css/matching/Card.css";
import starImg from "../../image/matching/star.svg";
import Img from "../../image/home/animal.svg";
import useMatchingStore from "../../api/matchingStore";
import NoHuman from "../../jsx/matching/Nohuman";

const FIXED_STARS = [
  { id: 0, left: 26, top: 10, size: 100, rot: 0, op: 0.55 },
  { id: 1, left: 10, top: 50, size: 80, rot: 0, op: 0.5 },
  { id: 2, left: 88, top: 37, size: 110, rot: 0, op: 0.6 },
];

const rem = (r) => r * 16;
const wrap = (i, n) => (i + n) % n;

export default function Card2() {
  // 1) 스토어 읽기 (훅 아님)
  const candidates = useMatchingStore((s) => s.candidates) || [];
  const N = candidates.length;

  // 2) ✅ 모든 훅은 무조건 최상단에서 먼저!
  const [center, setCenter] = useState(0);
  const centerRef = useRef(center);
  useEffect(() => {
    centerRef.current = center;
  }, [center]);

  const [dx, setDx] = useState(0);
  const [snapping, setSnapping] = useState(false);
  const [dir, setDir] = useState("");

  const dragging = useRef(false);
  const lastX = useRef(0);

  // 3) 그 다음에 조기 리턴
  if (N === 0) {
    return <NoHuman />;
  }

  // --- 이하 로직 동일 ---
  const CARD_W = rem(13);
  const GAP = rem(1.5);
  const SPREAD = CARD_W + GAP;
  const SNAP_MS = 260;
  const MAX_DRAG = CARD_W + GAP;

  const onStart = (x) => {
    dragging.current = true;
    setSnapping(false);
    setDir("");
    lastX.current = x;
  };

  const onMove = (x) => {
    if (!dragging.current) return;
    const delta = x - lastX.current;
    lastX.current = x;
    const nextDx = Math.max(-MAX_DRAG, Math.min(MAX_DRAG, dx + delta));
    setDx(nextDx);
  };

  const completeSlide = (sign) => {
    if (N <= 1) return;
    setSnapping(true);
    setDir(sign < 0 ? "dir-left" : "dir-right");
    setDx(sign * SPREAD);
    window.setTimeout(() => {
      const nextCenter =
        sign < 0 ? wrap(centerRef.current + 1, N) : wrap(centerRef.current - 1, N);
      centerRef.current = nextCenter;
      setCenter(nextCenter);
      setSnapping(false);
      setDx(0);
      setDir("");
    }, SNAP_MS);
  };

  const onEnd = () => {
    if (!dragging.current) return;
    dragging.current = false;
    const absDx = Math.abs(dx);
    const sign = dx < 0 ? -1 : 1;
    if (absDx >= MAX_DRAG / 2) {
      completeSlide(sign);
    } else {
      setSnapping(true);
      setDx(0);
      setTimeout(() => setSnapping(false), SNAP_MS);
    }
  };

  const xFarLeft = -2 * SPREAD + dx;
  const xLeft = -1 * SPREAD + dx;
  const xCenter = 0 * SPREAD + dx;
  const xRight = +1 * SPREAD + dx;
  const xFarRight = +2 * SPREAD + dx;

  const idxFarLeft = wrap(center - 2, N);
  const idxLeft = wrap(center - 1, N);
  const idxRight = wrap(center + 1, N);
  const idxFarRight = wrap(center + 2, N);

  const CardBody = ({ item }) => (
    <>
      <div className="card-stars" aria-hidden="true">
        {FIXED_STARS.map((s) => (
          <img
            key={s.id}
            src={starImg}
            alt=""
            className="star"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              opacity: s.op,
              transform: `translate(-50%, -50%) rotate(${s.rot}deg)`,
            }}
          />
        ))}
      </div>

      <div className="img-frame">
        <img src={item.typeImageUrl || Img} alt={item.name} draggable={false} />
      </div>

      <div className="arch" aria-hidden={false}>
        <div className="arch-content">
          <p className="name">{item.name || "이름 없음"}</p>
          <p className="major">{item.department || "학과 없음"}</p>
          <p className="msg">“{item.introduce || "소개 없음"}”</p>
        </div>
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
          <>
            <div className="slot slot-far-left" style={{ transform: `translate(calc(-50% + ${xFarLeft}px), -50%)` }}>
              <div className="card"><CardBody item={candidates[idxFarLeft]} /></div>
            </div>

            <div className="slot slot-left" style={{ transform: `translate(calc(-50% + ${xLeft}px), -50%)` }}>
              <div className="card"><CardBody item={candidates[idxLeft]} /></div>
            </div>

            <div className="slot slot-center" style={{ transform: `translate(calc(-50% + ${xCenter}px), -50%)` }}>
              <div className="card"><CardBody item={candidates[center]} /></div>
            </div>

            <div className="slot slot-right" style={{ transform: `translate(calc(-50% + ${xRight}px), -50%)` }}>
              <div className="card"><CardBody item={candidates[idxRight]} /></div>
            </div>

            <div className="slot slot-far-right" style={{ transform: `translate(calc(-50% + ${xFarRight}px), -50%)` }}>
              <div className="card"><CardBody item={candidates[idxFarRight]} /></div>
            </div>
          </>
        </div>
      </div>
    </>
  );
}
