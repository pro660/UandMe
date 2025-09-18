import React, { useRef, useState, useEffect } from "react";
import "../../css/matching/Card2.css";
import starImg from "../../image/matching/star.svg"; 
import Img from "../../image/home/animal.svg"; 
import useMatchingStore from "../../api/matchingStore"; // ✅ 매칭 스토어

/* 모든 카드에서 동일하게 사용할 별 3개의 고정 좌표/크기/회전/투명도 */
const FIXED_STARS = [
  { id: 0, left: 26, top: 10, size: 100, rot: 0,   op: 0.55 },
  { id: 1, left: 10, top: 50, size: 80, rot: 0,   op: 0.5  },
  { id: 2, left: 88, top: 37, size: 110, rot: 0,  op: 0.6  },
];

const rem = (r) => r * 16;
const wrap = (i, n) => (i + n) % n;

export default function Card2() {
  // ✅ 매칭 스토어에서 후보 3명 가져오기
  const candidates = useMatchingStore((s) => s.candidates) || [];
  const N = candidates.length;

  const [center, setCenter] = useState(0);
  const centerRef = useRef(center);
  useEffect(() => { centerRef.current = center; }, [center]);

  const [dx, setDx] = useState(0);
  const [snapping, setSnapping] = useState(false);
  const [dir, setDir] = useState("");

  const dragging = useRef(false);
  const lastX = useRef(0);

  // 카드 레이아웃
  const CARD_W = rem(13);
  const GAP    = rem(1.5);
  const SPREAD = CARD_W + GAP;
  const SNAP_MS = 260;

  // 드래그 시작
  const onStart = (x) => {
    dragging.current = true;
    setSnapping(false);
    setDir("");
    lastX.current = x;
  };

  const MAX_DRAG = CARD_W + GAP;

  // 드래그 중
  const onMove = (x) => {
    if (!dragging.current) return;
    const delta = x - lastX.current;
    lastX.current = x;
    const nextDx = Math.max(-MAX_DRAG, Math.min(MAX_DRAG, dx + delta));
    setDx(nextDx);
  };

  // 방향별 완료 스냅
  const completeSlide = (sign) => {
    if (N <= 1) return; // 후보가 1명 이하면 슬라이드 안함
    setSnapping(true);
    setDir(sign < 0 ? "dir-left" : "dir-right");
    setDx(sign * SPREAD);
    window.setTimeout(() => {
      const nextCenter = sign < 0
        ? wrap(centerRef.current + 1, N)
        : wrap(centerRef.current - 1, N);

      centerRef.current = nextCenter;
      setCenter(nextCenter);

      setSnapping(false);
      setDx(0);
      setDir("");
    }, SNAP_MS);
  };

  // 드래그 끝
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

  // 다섯 슬롯 위치
  const xFarLeft = -2 * SPREAD + dx;
  const xLeft    = -1 * SPREAD + dx;
  const xCenter  =  0 * SPREAD + dx;
  const xRight   = +1 * SPREAD + dx;
  const xFarRight= +2 * SPREAD + dx;

  // 다섯 장의 카드 인덱스
  const idxFarLeft  = wrap(center - 2, N);
  const idxLeft     = wrap(center - 1, N);
  const idxRight    = wrap(center + 1, N);
  const idxFarRight = wrap(center + 2, N);

  const CardBody = ({ item }) => (
    <>
      {/* 배경 별 */}
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

      {/* 프로필 이미지 */}
      <div className="img-frame">
        <img
          src={item.typeImageUrl || Img}
          alt={item.name}
          draggable={false}
        />
      </div>

      {/* 아치 내부 텍스트 */}
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
          {N > 0 ? (
            <>
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
            </>
          ) : (
            <p className="no-match">현재 매칭된 상대가 없습니다.</p>
          )}
        </div>
      </div>
    </>
  );
}
