// src/jsx/matching/Matching.jsx
import React, { useRef, useState, useEffect } from "react";
import api from "../../api/axios";
import useMatchingStore from "../../api/matchingStore";
import Card from "../../jsx/matching/Card";

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

export default function Matching() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [goCard, setGoCard] = useState(false);

  const setMatch      = useMatchingStore((s) => s.setMatch);
  const setCandidates = useMatchingStore((s) => s.setCandidates);

  // ====== 정적 데모(슬롯 3장) ======
  const PLACEHOLDER_COUNT = 3;
  const N = PLACEHOLDER_COUNT;

  const [center, setCenter] = useState(0);
  const centerRef = useRef(center);
  useEffect(() => { centerRef.current = center; }, [center]);

  const [dx, setDx] = useState(0);
  const [snapping, setSnapping] = useState(false);
  const [dir, setDir] = useState("");
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
    const nextDx = Math.max(-MAX_DRAG, Math.min(MAX_DRAG, dx + delta));
    setDx(nextDx);
  };
  const completeSlide = (sign) => {
    setSnapping(true);
    setDir(sign < 0 ? "dir-left" : "dir-right");
    setDx(sign * SPREAD);
    window.setTimeout(() => {
      const nextCenter = sign < 0
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

  const xFarLeft  = -2 * SPREAD + dx;
  const xLeft     = -1 * SPREAD + dx;
  const xCenter   =  0 * SPREAD + dx;
  const xRight    = +1 * SPREAD + dx;
  const xFarRight = +2 * SPREAD + dx;

  const CardBodyDemo = () => {
    const name = "???";
    const department = "?????????";
    const introduce = "???";
    return (
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
            <p className="name">{name}</p>
            <p className="major">{department}</p>
            <p className="msg">“{introduce}”</p>
          </div>
        </div>
      </>
    );
  };

  // ====== 프리스핀(간격 줄여가며 빠르게 슬라이드) ======
  const spinTimerRef = useRef(null);
  const startPreSpin = () => {
    stopPreSpin();
    let interval = 140;
    spinTimerRef.current = setInterval(() => {
      completeSlide(-1);
      interval = Math.max(90, interval - 5);
      stopPreSpin();
      spinTimerRef.current = setInterval(() => completeSlide(-1), interval);
    }, interval);
  };
  const stopPreSpin = () => {
    if (spinTimerRef.current) {
      clearInterval(spinTimerRef.current);
      spinTimerRef.current = null;
    }
  };
  useEffect(() => () => stopPreSpin(), []);

  // ====== 매칭 시작 (최소 스핀 시간 보장, 더미 주입 제거) ======
  const MIN_SPIN_MS = 1800;

  const startMatching = async () => {
    setLoading(true);
    setMessage("매칭 시작 중...");
    startPreSpin();
    const t0 = Date.now();

    try {
      const resp = await api.post("/match/start");
      const data = resp?.data;
      const listRaw = Array.isArray(data) ? data : (data?.candidates ?? []);
      const list = listRaw.slice(0, 3);

      // 최소 스핀 시간 보장
      const elapsed = Date.now() - t0;
      if (elapsed < MIN_SPIN_MS) {
        await sleep(MIN_SPIN_MS - elapsed);
      }

      setCandidates?.(list);
      if (list.length > 0) setMatch?.({ peer: list[0] });

      // Card에서 감속 이어받기(필요 시)
      sessionStorage.setItem("slot-handoff", "1");

      stopPreSpin();
      setGoCard(true);
    } catch (err) {
      console.error("❌ 매칭 실패:", err);
      setMessage("매칭 중 오류 발생");
      stopPreSpin();
      setLoading(false);
    }
  };

  if (goCard) {
    return <Card />; // Card.jsx로 전환
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
          <>
            <div className="slot" style={{ transform: `translate(calc(-50% + ${xFarLeft}px), -50%)` }}>
              <div className="card-m"><CardBodyDemo /></div>
            </div>
            <div className="slot" style={{ transform: `translate(calc(-50% + ${xLeft}px), -50%)` }}>
              <div className="card-m"><CardBodyDemo /></div>
            </div>
            <div className="slot" style={{ transform: `translate(calc(-50% + ${xCenter}px), -50%)` }}>
              <div className="card-m"><CardBodyDemo /></div>
            </div>
            <div className="slot" style={{ transform: `translate(calc(-50% + ${xRight}px), -50%)` }}>
              <div className="card-m"><CardBodyDemo /></div>
            </div>
            <div className="slot" style={{ transform: `translate(calc(-50% + ${xFarRight}px), -50%)` }}>
              <div className="card-m"><CardBodyDemo /></div>
            </div>
          </>
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
