// src/jsx/matching/Matching.jsx
import React, { useRef, useState, useEffect } from "react";
import api from "../../api/axios";
import useMatchingStore from "../../api/matchingStore";
import Card from "./Card";

import "../../css/matching/Matching.css";

import starImg from "../../image/matching/star.svg";
import unKnownImg from "../../image/matching/unknown.svg";

const FIXED_STARS = [ // 회색 흐릿한 별 이미지 위치 지정
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
  const snappingRef = useRef(false);
  useEffect(() => { snappingRef.current = snapping; }, [snapping]);

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

  // ====== 프리스핀 (API 대기 동안 슬롯머신처럼 계속 넘어감) ======
  const spinTimerRef = useRef(null);
  const startPreSpin = () => {
    stopPreSpin();
    const TICK = SNAP_MS + 40; // ✅ 스냅 시간보다 길게: 오버랩 방지
    spinTimerRef.current = setInterval(() => {
      if (snappingRef.current) return; // 진행 중이면 스킵
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

  // ====== 매칭 시작 (최소 스핀 시간 보장) ======
  const DEV_FAKE_ON_FAIL = false;    // 실패 시 데모 데이터 사용
  const MIN_SPIN_MS = 1800;          // 최소 스핀 시간(밀리초)

  const startMatching = async () => {
    setLoading(true);
    setMessage("매칭 시작 중...");
    startPreSpin(); // 🎰 회전 시작
    const t0 = Date.now();

    let list = [];
    let ok = false;

    try {
      const resp = await api.post("/match/start");
      const data = resp?.data;
      const listRaw = Array.isArray(data) ? data : (data?.candidates ?? []);
      list = listRaw.slice(0, 3);
      ok = true;
    } catch (err) {
      console.error("❌ 매칭 실패:", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "매칭 중 오류 발생";
      setMessage(msg);

      if (DEV_FAKE_ON_FAIL) {
        list = [
          { name: "데모A", department: "컴퓨터공학과", introduce: "슬롯 데모입니다 ✨", typeImageUrl: "" },
          { name: "데모B", department: "경영학과",   introduce: "프론트 미리보기 👋", typeImageUrl: "" },
          { name: "데모C", department: "디자인학과", introduce: "애니메이션 확인용 🎡", typeImageUrl: "" },
        ];
        setMessage("데모 모드: 임시 후보로 미리보기");
        ok = true;
      }
    }

    // ✅ 최소 스핀 시간 보장
    const elapsed = Date.now() - t0;
    if (elapsed < MIN_SPIN_MS) {
      await sleep(MIN_SPIN_MS - elapsed);
    }

    stopPreSpin();

    if (ok) {
      setCandidates?.(list);
      if (list.length > 0) setMatch?.({ peer: list[0] });
      // sessionStorage.setItem("slot-handoff", "1"); // ❌ 사용하지 않으므로 제거
      setGoCard(true); // 전환
    } else {
      setLoading(false);
    }
  };

  // 전환
  if (goCard) {
    return <Card />;
  }

  // 정적 데모 + 버튼
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
          <> {/* 카드 관련 div */}
            <div className="slot" style={{ transform: `translate(calc(-50% + ${-2 * SPREAD + dx}px), -50%)` }}>
              <div className="card-m"><CardBodyDemo /></div>
            </div>
            <div className="slot" style={{ transform: `translate(calc(-50% + ${-1 * SPREAD + dx}px), -50%)` }}>
              <div className="card-m"><CardBodyDemo /></div>
            </div>
            <div className="slot" style={{ transform: `translate(calc(-50% + ${0 * SPREAD + dx}px), -50%)` }}>
              <div className="card-m"><CardBodyDemo /></div>
            </div>
            <div className="slot" style={{ transform: `translate(calc(-50% + ${1 * SPREAD + dx}px), -50%)` }}>
              <div className="card-m"><CardBodyDemo /></div>
            </div>
            <div className="slot" style={{ transform: `translate(calc(-50% + ${2 * SPREAD + dx}px), -50%)` }}>
              <div className="card-m"><CardBodyDemo /></div>
            </div>
          </>
        </div>

        {/* 매칭하기 버튼 */}
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
