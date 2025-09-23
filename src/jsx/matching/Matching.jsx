// src/jsx/matching/Matching.jsx
import React, { useRef, useState, useEffect } from "react";
import Card from "./Card";
import "../../css/matching/Matching.css";

import starImg from "../../image/matching/star.svg";
import unKnownImg from "../../image/matching/unknown.svg";

/* 카드 배경 별 위치 */
const FIXED_STARS = [
  { id: 0, left: 26, top: 10, size: 100, rot: 0, op: 0.55 },
  { id: 1, left: 10, top: 50, size: 80, rot: 0.5, op: 0.5 },
  { id: 2, left: 88, top: 37, size: 110, rot: 0, op: 0.6 },
];

/* Card로 넘길 더미 후보들 */
const DUMMY_CANDIDATES = [
  {
    userId: 101,
    name: "김하늘",
    department: "미디어커뮤니케이션학과",
    introduce: "사람 만나는 걸 좋아해요. 축제 먹거리 탐방 같이 갈 분?",
    profileImageUrl: "",
    typeImageUrl: "",
  },
  {
    userId: 102,
    name: "박시우",
    department: "컴퓨터공학과",
    introduce: "고양이 집사·사진 찍기 좋아함. 사진 스팟 추천해요!",
    profileImageUrl: "",
    typeImageUrl: "",
  },
  {
    userId: 103,
    name: "이서연",
    department: "경영학과",
    introduce: "밝고 유쾌한 사람 좋아요 :) 소소한 대화부터 시작해요",
    profileImageUrl: "",
    typeImageUrl: "",
  },
  {
    userId: 104,
    name: "최민준",
    department: "스포츠과학과",
    introduce: "러닝 메이트 구합니다! 축제 달리기 이벤트 같이 가요",
    profileImageUrl: "",
    typeImageUrl: "",
  },
  {
    userId: 105,
    name: "정다은",
    department: "디자인학부",
    introduce: "드로잉·전시 좋아해요. 포스터 부스 같이 구경해요!",
    profileImageUrl: "",
    typeImageUrl: "",
  },
];

const rem = (r) => r * 16;

/* 데모 카드 본문 (정적) */
const CardBodyDemo = () => (
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
    <div className="img-frame-m">
      <img src={unKnownImg} alt="unknown" draggable={false} />
    </div>
    <div className="arch-m" aria-hidden={false}>
      <div className="arch-content">
        <p className="name">???</p>
        <p className="major">?????????</p>
        <p className="msg">“???”</p>
      </div>
    </div>
  </>
);

export default function Matching() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [goCard, setGoCard] = useState(false);
  const [resultList, setResultList] = useState([]); // → 더미를 이쪽에 담아 넘김

  // ====== 슬롯 애니메이션(가벼운 연출) ======
  const PLACEHOLDER_COUNT = 3;
  const N = PLACEHOLDER_COUNT;
  const [center, setCenter] = useState(0);
  const centerRef = useRef(center);
  useEffect(() => {
    centerRef.current = center;
  }, [center]);

  const [dx, setDx] = useState(0);
  const [snapping, setSnapping] = useState(false);
  const [dir, setDir] = useState("");
  const snappingRef = useRef(false);
  useEffect(() => {
    snappingRef.current = snapping;
  }, [snapping]);

  const dragging = useRef(false);
  const lastX = useRef(0);

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
    setDx((prev) => Math.max(-MAX_DRAG, Math.min(MAX_DRAG, prev + delta)));
  };
  const completeSlide = (sign) => {
    setSnapping(true);
    setDir(sign < 0 ? "dir-left" : "dir-right");
    setDx(sign * SPREAD);
    window.setTimeout(() => {
      const nextCenter =
        sign < 0
          ? (centerRef.current + 1) % N
          : (centerRef.current - 1 + N) % N;
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

  // ====== 프리스핀 ======
  const spinTimerRef = useRef(null);
  const startPreSpin = () => {
    stopPreSpin();
    const TICK = SNAP_MS + 40;
    spinTimerRef.current = setInterval(() => {
      if (snappingRef.current) return;
      completeSlide(-1);
    }, TICK);
  };
  const stopPreSpin = () => {
    if (spinTimerRef.current) {
      clearInterval(spinTimerRef.current);
      spinTimerRef.current = null;
    }
  };
  useEffect(() => () => stopPreSpin(), []);

  // ====== 매칭 시작 (API 없이 더미로 전환) ======
  const MIN_SPIN_MS = 1200; // 짧은 연출

  const startMatching = () => {
    setLoading(true);
    setMessage("매칭 시작 중...");
    startPreSpin();

    setTimeout(() => {
      stopPreSpin();
      setResultList(DUMMY_CANDIDATES); // ✅ 더미 후보 주입
      setGoCard(true);
      setLoading(false);
      setMessage("");
    }, MIN_SPIN_MS);
  };

  // ✅ 결과 분기: Card로 진입하며 더미 전달
  if (goCard) {
    return <Card initialCandidates={resultList} />;
  }

  return (
    <div className="match-page matching-scope">
      <div className="title-m">매칭 버튼을 누르세요</div>

      <div className="card-root-m">
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
          {/* 데모 카드 5장 */}
          {[...Array(5)].map((_, idx) => (
            <div
              key={idx}
              className="slot"
              style={{
                transform: `translate(calc(-50% + ${
                  (-2 + idx) * SPREAD + dx
                }px), -50%)`,
              }}
            >
              <div className="card-m">
                <CardBodyDemo />
              </div>
            </div>
          ))}
        </div>

        <div className="cta-wrap">
          <button
            type="button"
            className="cta-btn"
            onClick={startMatching}
            disabled={loading}
          >
            {loading ? "매칭 시작 중..." : "매칭하기"}
          </button>
        </div>

        {message && (
          <p style={{ textAlign: "center", marginTop: "0.5rem" }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
