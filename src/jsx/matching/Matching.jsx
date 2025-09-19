import React, { useRef, useState, useEffect } from "react";
import api from "../../api/axios";
import Card from "./Card";
import Nohuman from "./Nohuman"; // ✅ 추가
import "../../css/matching/Matching.css";

import starImg from "../../image/matching/star.svg";
import unKnownImg from "../../image/matching/unknown.svg";

const FIXED_STARS = [
  { id: 0, left: 26, top: 10, size: 100, rot: 0, op: 0.55 },
  { id: 1, left: 10, top: 50, size: 80, rot: 0, op: 0.5 },
  { id: 2, left: 88, top: 37, size: 110, rot: 0, op: 0.6 },
];

const rem = (r) => r * 16;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const normalizeList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.candidates)) return data.candidates;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

export default function Matching() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [goCard, setGoCard] = useState(false);
  const [resultList, setResultList] = useState([]);

  // ====== 슬롯 애니메이션 관련 ======
  const PLACEHOLDER_COUNT = 3;
  const N = PLACEHOLDER_COUNT;
  const [center, setCenter] = useState(0);
  const centerRef = useRef(center);
  useEffect(() => { centerRef.current = center; }, [center]);

  const [dx, setDx] = useState(0);
  const [snapping, setSnapping] = useState(false);
  const [dir, setDir] = useState("");
  const snappingRef = useRef(false);
  useEffect(() => { snappingRef.current = snapping; }, [snapping]);

  const dragging = useRef(false);
  const lastX = useRef(0);

  const CARD_W = rem(13);
  const GAP = rem(1.5);
  const SPREAD = CARD_W + GAP;
  const SNAP_MS = 260;
  const MAX_DRAG = CARD_W + GAP;

  const onStart = (x) => { dragging.current = true; setSnapping(false); setDir(""); lastX.current = x; };
  const onMove  = (x) => {
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
      const nextCenter = sign < 0 ? (centerRef.current + 1) % N : (centerRef.current - 1 + N) % N;
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
    else { setSnapping(true); setDx(0); setTimeout(() => setSnapping(false), SNAP_MS); }
  };

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

  // ====== 매칭 시작 ======
  const MIN_SPIN_MS = 1800;

  const startMatching = async () => {
    setLoading(true);
    setMessage("매칭 시작 중...");
    startPreSpin();
    const t0 = Date.now();

    try {
      const resp = await api.post("/match/start");
      const list = normalizeList(resp?.data);

      // 최소 스핀 시간 보장
      const elapsed = Date.now() - t0;
      if (elapsed < MIN_SPIN_MS) await sleep(MIN_SPIN_MS - elapsed);

      stopPreSpin();

      setResultList(list);
      setGoCard(true);
    } catch (err) {
      console.error("❌ 매칭 실패:", err);
      const msg = err?.response?.data?.message || err?.message || "매칭 중 오류 발생";
      setMessage(msg);
      stopPreSpin();
      setLoading(false);
    }
  };

  // ✅ 결과 분기 처리
  if (goCard) {
    if (resultList.length === 0) {
      return <Nohuman />; // 👉 빈 배열이면 안내 화면
    }
    return <Card initialCandidates={resultList} />;
  }

  return (
    <div className="match-page matching-scope">
      <div className="title-m">매칭 버튼을 누르세요</div>

      <div className="card-root-m">
        <div
          className={`card-wrap ${snapping ? "snapping" : ""} ${dir}`}
          onTouchStart={(e) => onStart(e.touches[0].clientX)}
          onTouchMove={(e)  => onMove(e.touches[0].clientX)}
          onTouchEnd={onEnd}
          onMouseDown={(e) => onStart(e.clientX)}
          onMouseMove={(e)  => onMove(e.clientX)}
          onMouseUp={onEnd}
          onMouseLeave={onEnd}
        >
          {/* 데모 카드 5장 */}
          {[...Array(5)].map((_, idx) => (
            <div
              key={idx}
              className="slot"
              style={{
                transform: `translate(calc(-50% + ${(-2 + idx) * SPREAD + dx}px), -50%)`,
              }}
            >
              <div className="card-m"><CardBodyDemo /></div>
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
          <p style={{ textAlign: "center", marginTop: "0.5rem" }}>{message}</p>
        )}
      </div>
    </div>
  );
}
