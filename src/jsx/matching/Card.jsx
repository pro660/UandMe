import React, { useRef, useState } from "react";
import "../../css/matching/Card.css";

const candidates = [
  { id: 1, name: "정민",   major: "항공소프트웨어공학과", msg: "반갑습니다", img: "/images/panda.png" },
  { id: 2, name: "정재민", major: "항공소프트웨어공학과", msg: "안녕하세요", img: "/images/dog.png" },
  { id: 3, name: "종민",   major: "항공소프트웨어공학과", msg: "좋은 하루!", img: "/images/cat.png"  },
];

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const rem = (r) => r * 16; // 1rem = 16px

export default function Card() {
  // 처음 상태: 1 - "2" - 3
  const [center, setCenter] = useState(1);
  const [dx, setDx] = useState(0);
  const [snapping, setSnapping] = useState(false);

  const startX = useRef(0);
  const dragging = useRef(false);

  const THRESH = rem(6);      // 스와이프 임계(≈96px)
  const SPREAD = rem(9);      // 좌/우 간격(≈144px)
  const SNAP_MS = 260;        // transition과 동일
  const GHOST_OFFSET = rem(5.2); // 고스트를 센터 옆에 붙일 거리(≈83px)

  const onStart = (x) => {
    dragging.current = true;
    setSnapping(false);
    startX.current = x;
  };

  const onMove = (x) => {
    if (!dragging.current) return;
    setDx(x - startX.current);
  };

  // 2단계 스냅: 1) p=-1/1까지 스냅 → 2) center 교체 후 p=0
  const smoothTransition = (targetP, onAfter) => {
    setSnapping(true);
    setDx(targetP * THRESH);
    window.setTimeout(() => {
      setSnapping(false);
      onAfter?.();
      setDx(0);
    }, SNAP_MS);
  };

  const onEnd = () => {
    if (!dragging.current) return;
    dragging.current = false;

    const p = clamp(dx / THRESH, -1, 1);

    if (p <= -1 && center < candidates.length - 1) {
      // 왼쪽 스와이프: 오른쪽 카드가 중앙으로
      smoothTransition(-1, () => setCenter((c) => c + 1));
      return;
    }
    if (p >= 1 && center > 0) {
      // 오른쪽 스와이프: 왼쪽 카드가 중앙으로
      smoothTransition(1, () => setCenter((c) => c - 1));
      return;
    }

    // 임계 미달 → 원위치
    setSnapping(true);
    setDx(0);
    window.setTimeout(() => setSnapping(false), SNAP_MS);
  };

  // 좌/우/두 칸 떨어진 인덱스 (없으면 null)
  const L  = center - 1 >= 0 ? center - 1 : null;
  const R  = center + 1 < candidates.length ? center + 1 : null;
  const LL = center - 2 >= 0 ? center - 2 : null;
  const RR = center + 2 < candidates.length ? center + 2 : null;

  const p = clamp(dx / THRESH, -1, 1);

  // 슬롯 위치 (덱 전체 이동 X, 슬롯 개별 이동)
  const xLeft   = -SPREAD + p * SPREAD;
  const xCenter = 0 + p * SPREAD;
  const xRight  = +SPREAD + p * SPREAD;

  // 페이드 아웃(사이드가 바깥으로 밀릴수록 사라짐)
  const leftFadeOut  = p < 0 ? 1 + p : 1; // 왼쪽 드래그 시 왼쪽 카드 1→0
  const rightFadeOut = p > 0 ? 1 - p : 1; // 오른쪽 드래그 시 오른쪽 카드 1→0

  // ====== 고스트: 센터 기준 옆에서 등장 (동적 위치) ======
  // 왼쪽 드래그(p<0): 센터 오른쪽 옆에 RR(다다음=보통 3번) 희미→진하게
  const ghostRightOpacity = (p < 0 && RR !== null) ? -p : 0;
  const ghostRightX = xCenter + GHOST_OFFSET;
  const ghostRightCard = RR !== null ? candidates[RR] : null;

  // 오른쪽 드래그(p>0): 센터 왼쪽 옆에 LL(다다이전=보통 1번) 희미→진하게
  const ghostLeftOpacity = (p > 0 && LL !== null) ? p : 0;
  const ghostLeftX = xCenter - GHOST_OFFSET;
  const ghostLeftCard = LL !== null ? candidates[LL] : null;

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
          className={`card-wrap ${snapping ? "snapping" : ""}`}
          onTouchStart={(e) => onStart(e.touches[0].clientX)}
          onTouchMove={(e) => onMove(e.touches[0].clientX)}
          onTouchEnd={onEnd}
          onMouseDown={(e) => onStart(e.clientX)}
          onMouseMove={(e) => onMove(e.clientX)}
          onMouseUp={onEnd}
          onMouseLeave={onEnd}
        >
          {/* 왼쪽 슬롯 */}
          {L !== null && (
            <div
              className="slot slot-left"
              style={{ transform: `translate(calc(-50% + ${xLeft}px), -50%)` }}
            >
              <div className="card card-left" style={{ opacity: leftFadeOut }}>
                <CardBody item={candidates[L]} />
              </div>
            </div>
          )}

          {/* 가운데 슬롯 (항상 위 z-index) */}
          <div
            className="slot slot-center"
            style={{ transform: `translate(calc(-50% + ${xCenter}px), -50%)` }}
          >
            <div className="card card-center">
              <CardBody item={candidates[center]} />
            </div>
          </div>

          {/* 오른쪽 슬롯 */}
          {R !== null && (
            <div
              className="slot slot-right"
              style={{ transform: `translate(calc(-50% + ${xRight}px), -50%)` }}
            >
              <div className="card card-right" style={{ opacity: rightFadeOut }}>
                <CardBody item={candidates[R]} />
              </div>
            </div>
          )}

          {/* ====== 고스트 레이어들 (센터 옆에서 동적 위치) ====== */}
          {ghostRightCard && (
            <div
              className="ghost ghost-right"
              style={{
                transform: `translate(calc(-50% + ${ghostRightX}px), -50%)`,
                opacity: ghostRightOpacity
              }}
            >
              <div className="card ghost-card">
                <CardBody item={ghostRightCard} />
              </div>
            </div>
          )}

          {ghostLeftCard && (
            <div
              className="ghost ghost-left"
              style={{
                transform: `translate(calc(-50% + ${ghostLeftX}px), -50%)`,
                opacity: ghostLeftOpacity
              }}
            >
              <div className="card ghost-card">
                <CardBody item={ghostLeftCard} />
              </div>
            </div>
          )}
          {/* =============================================== */}
        </div>
      </div>
    </>
  );
}
