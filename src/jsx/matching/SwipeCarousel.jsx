// src/jsx/matching/components/SwipeCarousel.jsx
import React, { useRef, useState, useEffect } from "react";

/** px 계산 유틸 */
const rem = (r) => r * 16;
const wrap = (i, n) => (i + n) % n;

/**
 * SwipeCarousel
 * props:
 *  - items: any[]                렌더할 원소 배열
 *  - renderCard: (item)=>React   카드 내용 렌더 함수
 *  - onIndexChange?: (i)=>void   중앙 인덱스 변경 콜백 (선택)
 *  - className?: string          래퍼에 추가 클래스 (선택)
 */
export default function SwipeCarousel({ items = [], renderCard, onIndexChange, className = "" }) {
  const N = items.length;

  // 내부 상태
  const [center, setCenter] = useState(0);
  const centerRef = useRef(center);
  useEffect(() => { centerRef.current = center; }, [center]);
  useEffect(() => { onIndexChange?.(center); }, [center, onIndexChange]);

  const [dx, setDx] = useState(0);
  const [snapping, setSnapping] = useState(false);
  const [dir, setDir] = useState("");

  const dragging = useRef(false);
  const lastX = useRef(0);

  // 치수
  const CARD_W = rem(13);
  const GAP = rem(1.5);
  const SPREAD = CARD_W + GAP;
  const SNAP_MS = 260;
  const MAX_DRAG = CARD_W + GAP;

  // 인원수 분기
  const hasOne = N === 1;
  const hasTwo = N === 2;
  const hasThreePlus = N >= 3;

  // 좌표
  const xFarLeft  = -2 * SPREAD + dx;
  const xLeft     = -1 * SPREAD + dx;
  const xCenter   =  0 * SPREAD + dx;
  const xRight    = +1 * SPREAD + dx;
  const xFarRight = +2 * SPREAD + dx;

  // N=2 전용 좌표
  const xTwoLeft  = -SPREAD / 2 + dx;
  const xTwoRight =  SPREAD / 2 + dx;

  // 인덱스
  const idxFarLeft  = wrap(center - 2, N);
  const idxLeft     = wrap(center - 1, N);
  const idxRight    = wrap(center + 1, N);
  const idxFarRight = wrap(center + 2, N);
  const otherIdx    = wrap(center + 1, N);

  // 드래그
  const onStart = (x) => {
    if (hasOne) return; // 1명일 땐 드래그 비활성화
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
    if (absDx >= MAX_DRAG / 2) completeSlide(sign);
    else {
      setSnapping(true);
      setDx(0);
      setTimeout(() => setSnapping(false), SNAP_MS);
    }
  };

  if (N === 0) return null;

  return (
    <div
      className={`card-wrap ${snapping ? "snapping" : ""} ${dir} ${className}`}
      onTouchStart={(e) => !hasOne && onStart(e.touches[0].clientX)}
      onTouchMove={(e)  => !hasOne && onMove(e.touches[0].clientX)}
      onTouchEnd={onEnd}
      onMouseDown={(e) => !hasOne && onStart(e.clientX)}
      onMouseMove={(e)  => !hasOne && onMove(e.clientX)}
      onMouseUp={onEnd}
      onMouseLeave={onEnd}
    >
      <>
        {/* N=1: 중앙 1장만 */}
        {hasOne && (
          <div className="slot slot-center" style={{ transform: `translate(calc(-50% + ${xCenter}px), -50%)` }}>
            <div className="card">{renderCard(items[center])}</div>
          </div>
        )}

        {/* N=2: 좌/우 2장 */}
        {hasTwo && (
          <>
            <div className="slot slot-left"  style={{ transform: `translate(calc(-50% + ${xTwoLeft}px), -50%)`  }}>
              <div className="card">{renderCard(items[center])}</div>
            </div>
            <div className="slot slot-right" style={{ transform: `translate(calc(-50% + ${xTwoRight}px), -50%)` }}>
              <div className="card">{renderCard(items[otherIdx])}</div>
            </div>
          </>
        )}

        {/* N>=3: 5슬롯 */}
        {hasThreePlus && (
          <>
            <div className="slot slot-far-left" style={{ transform: `translate(calc(-50% + ${xFarLeft}px), -50%)` }}>
              <div className="card">{renderCard(items[idxFarLeft])}</div>
            </div>
            <div className="slot slot-left" style={{ transform: `translate(calc(-50% + ${xLeft}px), -50%)` }}>
              <div className="card">{renderCard(items[idxLeft])}</div>
            </div>
            <div className="slot slot-center" style={{ transform: `translate(calc(-50% + ${xCenter}px), -50%)` }}>
              <div className="card">{renderCard(items[center])}</div>
            </div>
            <div className="slot slot-right" style={{ transform: `translate(calc(-50% + ${xRight}px), -50%)` }}>
              <div className="card">{renderCard(items[idxRight])}</div>
            </div>
            <div className="slot slot-far-right" style={{ transform: `translate(calc(-50% + ${xFarRight}px), -50%)` }}>
              <div className="card">{renderCard(items[idxFarRight])}</div>
            </div>
          </>
        )}
      </>
    </div>
  );
}
