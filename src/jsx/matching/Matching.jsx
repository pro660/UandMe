// src/jsx/matching/Matching.jsx
import React, { useRef, useState, useEffect } from "react";
import api from "../../api/axios";                          // ✅ API 호출
import useMatchingStore from "../../api/matchingStore";     // ✅ setMatch, setCandidates (persist: matching-storage)
import Card from "../../jsx/matching/Card";                                  // ✅ 성공 시 이 컴포넌트를 그대로 렌더

import "../../css/matching/Matching.css";

import starImg from "../../image/matching/star.svg";
import unKnownImg from "../../image/matching/unknown.svg";

// 고정 별 위치
const FIXED_STARS = [
  { id: 0, left: 26, top: 10, size: 100, rot: 0, op: 0.55 },
  { id: 1, left: 10, top: 50, size: 80, rot: 0, op: 0.5 },
  { id: 2, left: 88, top: 37, size: 110, rot: 0, op: 0.6 },
];

const rem = (r) => r * 16;

export default function Matching() {
  // 버튼/메시지 상태
  const [message, setMessage] = useState("");
  const [loading,   setLoading] = useState(false);
  const [goCard,    setGoCard]  = useState(false); // ✅ 성공 시 Card.jsx로 전환

  // 전역 저장 액션 (localStorage key: matching-storage)
  const setMatch      = useMatchingStore((s) => s.setMatch);
  const setCandidates = useMatchingStore((s) => s.setCandidates);

  // ================= 스와이프 데모(정적 카드) 상태 =================
  const PLACEHOLDER_COUNT = 3; // 데모용 3장
  const N = PLACEHOLDER_COUNT;

  const [center, setCenter] = useState(0);
  const centerRef = useRef(center);
  useEffect(() => { centerRef.current = center; }, [center]);

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

  // 드래그 핸들러
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

  // 슬롯 좌표
  const xFarLeft  = -2 * SPREAD + dx;
  const xLeft     = -1 * SPREAD + dx;
  const xCenter   =  0 * SPREAD + dx;
  const xRight    = +1 * SPREAD + dx;
  const xFarRight = +2 * SPREAD + dx;

  // 데모 카드 내용 (???)
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

  // ================= 매칭 시작: 후보 저장 후 Card.jsx로 전환 =================
  const startMatching = async () => {
    try {
      setLoading(true);
      setMessage("매칭 시작 중...");

      const resp = await api.post("/match/start");
      const data = resp?.data;

      // 배열 또는 { candidates: [...] } 대응, 최대 3명 저장
      const listRaw = Array.isArray(data) ? data : (data?.candidates ?? []);
      const list = listRaw.slice(0, 3);

      setCandidates?.(list);                 // matching-storage에 candidates 저장

      if (list.length > 0) {
        // 선택된 상대(초기 기준)는 Card.jsx에서 처리해도 되고, 여기서 peer로 한 번 넣어도 됨
        setMatch?.({ peer: list[0] });
        setMessage(`후보 ${list.length}명 저장 완료`);
        setGoCard(true);                     // ✅ 라우팅 없이 Card 컴포넌트로 전환
      } else {
        setMessage("후보가 없습니다. (0명 저장)");
        // 후보 0명이어도 Card.jsx에서 '없음' UI가 있으니 전환을 원하면 아래 주석 해제
        setGoCard(true);
      }
    } catch (err) {
      console.error("❌ 매칭 실패:", err);
      setMessage("매칭 중 오류 발생");
    } finally {
      setLoading(false);
    }
  };

  // ✅ API 성공 후: 라우팅 없이 Card.jsx 컴포넌트 자체 렌더
  if (goCard) {
    return <Card />;
  }

  // ✅ 성공 전: 정적 데모 + 버튼
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

        {/* 하단 버튼 & 메시지 */}
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
