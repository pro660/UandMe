// src/jsx/matching/Card.jsx
import React, { useRef, useState, useEffect } from "react";
import api from "../../api/axios.js";
import "../../css/matching/Card.css";

import starImg from "../../image/matching/star.svg";
import useMatchingStore from "../../api/matchingStore";
import NoHuman from "./Nohuman";
import YouProfile from "../mypage/YouProfile.jsx"; // ✅ 모달로 띄울 컴포넌트

const FIXED_STARS = [
  { id: 0, left: 26, top: 10, size: 100, rot: 0, op: 0.55 },
  { id: 1, left: 10, top: 50, size: 80, rot: 0, op: 0.5 },
  { id: 2, left: 88, top: 37, size: 110, rot: 0, op: 0.6 },
];

const rem = (r) => r * 16;
const wrap = (i, n) => (i + n) % n;

export default function Card() {
  const candidates = useMatchingStore((s) => s.candidates) || [];
  const setCandidates = useMatchingStore((s) => s.setCandidates);

  const [selectedUserId, setSelectedUserId] = useState(null); // ✅ 모달용 상태
  const N = candidates.length;

  // 문자열 길이 절반에서 줄바꿈
  function breakAtHalf(text) {
    const raw = (text ?? "").trim();
    const arr = Array.from(raw);
    const n = arr.length;
    if (n < 2) return raw;

    const mid = Math.floor(n / 2);
    const isBreak = (ch) => /\s|[.,!?;:·・\-—]/.test(ch);

    let idx = mid;
    for (let d = 0; d <= Math.min(8, n - 1); d++) {
      const L = mid - d,
        R = mid + d;
      if (L > 0 && isBreak(arr[L])) {
        idx = L + 1;
        break;
      }
      if (R < n - 1 && isBreak(arr[R])) {
        idx = R + 1;
        break;
      }
    }

    const head = arr.slice(0, idx).join("");
    const tail = arr.slice(idx).join("");
    return `${head}\n${tail}`;
  }

  // 상태 관리
  const [center, setCenter] = useState(0);
  const centerRef = useRef(center);
  useEffect(() => {
    centerRef.current = center;
  }, [center]);

  const [dx, setDx] = useState(0);
  const [snapping, setSnapping] = useState(false);
  const [dir, setDir] = useState("");
  const [loading, setLoading] = useState(false);

  const dragging = useRef(false);
  const lastX = useRef(0);

  if (N === 0) {
    return <NoHuman />;
  }

  // 카드 치수
  const CARD_W = rem(13);
  const GAP = rem(1.5);
  const SPREAD = CARD_W + GAP;
  const SNAP_MS = 260;
  const MAX_DRAG = CARD_W + GAP;

  // 인원수 분기
  const hasOne = N === 1;
  const hasTwo = N === 2;
  const hasThreePlus = N >= 3;

  // N=2 전용
  const xTwoLeft = -SPREAD / 2 + dx;
  const xTwoRight = SPREAD / 2 + dx;
  const otherIdx = wrap(center + 1, N);

  // 드래그
  const onStart = (x) => {
    if (hasOne) return;
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
        sign < 0
          ? wrap(centerRef.current + 1, N)
          : wrap(centerRef.current - 1, N);
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

  // 다시 매칭하기 API
  const handleRematch = async () => {
    try {
      setLoading(true);
      const res = await api.post("/match/start", {});
      const payload = res?.data;
      const nextList = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.candidates)
        ? payload.candidates
        : [];

      if (typeof setCandidates === "function") {
        setCandidates(nextList);
      }

      setCenter(0);
      setDx(0);
      setSnapping(false);
      setDir("");

      if (!nextList.length) {
        alert("새 매칭 결과가 없습니다.");
      }
    } catch (err) {
      console.error(err);
      alert("매칭 시작 요청에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 슬롯 좌표
  const xFarLeft = -2 * SPREAD + dx;
  const xLeft = -1 * SPREAD + dx;
  const xCenter = 0 * SPREAD + dx;
  const xRight = +1 * SPREAD + dx;
  const xFarRight = +2 * SPREAD + dx;

  // 인덱스
  const idxFarLeft = wrap(center - 2, N);
  const idxLeft = wrap(center - 1, N);
  const idxRight = wrap(center + 1, N);
  const idxFarRight = wrap(center + 2, N);

  // 카드 내부
  const CardBody = ({ item = {} }) => {
    const {
      userId, // ✅ candidateId → userId
      name = "이름 없음",
      department = "학과 없음",
      introduce = "소개 없음",
      typeImageUrl,
    } = item;
    const msgText = breakAtHalf(introduce);

    return (
      <div
        className="card-click-area"
        onClick={() => setSelectedUserId(userId)} // ✅ 모달 오픈
      >
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
          <img src={typeImageUrl} alt={name} draggable={false} />
        </div>

        {/* 텍스트 */}
        <div className="arch" aria-hidden={false}>
          <div className="arch-content">
            <p className="name">{name}</p>
            <p className="major">{department}</p>
            <p className="msg">“{msgText}”</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="title">원하는 상대에게 플러팅하세요</div>

      <div className="card-root">
        <div
          className={`card-wrap ${snapping ? "snapping" : ""} ${dir}`}
          onTouchStart={(e) => !hasOne && onStart(e.touches[0].clientX)}
          onTouchMove={(e) => !hasOne && onMove(e.touches[0].clientX)}
          onTouchEnd={onEnd}
          onMouseDown={(e) => !hasOne && onStart(e.clientX)}
          onMouseMove={(e) => !hasOne && onMove(e.clientX)}
          onMouseUp={onEnd}
          onMouseLeave={onEnd}
        >
          {/* === N=1 === */}
          {hasOne && (
            <div
              className="slot slot-center"
              style={{
                transform: `translate(calc(-50% + ${xCenter}px), -50%)`,
              }}
            >
              <div className="card">
                <CardBody item={candidates[center]} />
              </div>
            </div>
          )}

          {/* === N=2 === */}
          {hasTwo && (
            <>
              <div
                className="slot slot-left"
                style={{
                  transform: `translate(calc(-50% + ${xTwoLeft}px), -50%)`,
                }}
              >
                <div className="card">
                  <CardBody item={candidates[center]} />
                </div>
              </div>

              <div
                className="slot slot-right"
                style={{
                  transform: `translate(calc(-50% + ${xTwoRight}px), -50%)`,
                }}
              >
                <div className="card">
                  <CardBody item={candidates[otherIdx]} />
                </div>
              </div>
            </>
          )}

          {/* === N>=3 === */}
          {hasThreePlus && (
            <>
              <div
                className="slot slot-far-left"
                style={{
                  transform: `translate(calc(-50% + ${xFarLeft}px), -50%)`,
                }}
              >
                <div className="card">
                  <CardBody item={candidates[idxFarLeft]} />
                </div>
              </div>

              <div
                className="slot slot-left"
                style={{
                  transform: `translate(calc(-50% + ${xLeft}px), -50%)`,
                }}
              >
                <div className="card">
                  <CardBody item={candidates[idxLeft]} />
                </div>
              </div>

              <div
                className="slot slot-center"
                style={{
                  transform: `translate(calc(-50% + ${xCenter}px), -50%)`,
                }}
              >
                <div className="card">
                  <CardBody item={candidates[center]} />
                </div>
              </div>

              <div
                className="slot slot-right"
                style={{
                  transform: `translate(calc(-50% + ${xRight}px), -50%)`,
                }}
              >
                <div className="card">
                  <CardBody item={candidates[idxRight]} />
                </div>
              </div>

              <div
                className="slot slot-far-right"
                style={{
                  transform: `translate(calc(-50% + ${xFarRight}px), -50%)`,
                }}
              >
                <div className="card">
                  <CardBody item={candidates[idxFarRight]} />
                </div>
              </div>
            </>
          )}
        </div>

        {/* CTA 버튼 */}
        <div className="cta-wrap">
          <button
            type="button"
            className="cta-btn"
            onClick={handleRematch}
            disabled={loading}
          >
            {loading ? "매칭 시작 중..." : "다시 매칭하기"}
          </button>
        </div>
      </div>

      {/* ✅ 모달: selectedUserId 있을 때만 */}
      {selectedUserId && (
        <div className="modal-overlay">
          <div className="modal-content">
            <YouProfile
              userId={selectedUserId}
              onClose={() => setSelectedUserId(null)}
            />
          </div>
        </div>
      )}
    </>
  );
}
