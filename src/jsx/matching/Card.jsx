// src/jsx/matching/Card.jsx
import React, { useRef, useState, useEffect } from "react";
// ✅ 공용 axios 인스턴스 사용
import api from "../../api/axios.js";

import "../../css/matching/Card.css";

import starImg from "../../image/matching/star.svg";
import Img from "../../image/home/animal.svg";
import useMatchingStore from "../../api/matchingStore";
import NoHuman from "./Nohuman";

const FIXED_STARS = [
  { id: 0, left: 26, top: 10, size: 100, rot: 0, op: 0.55 },
  { id: 1, left: 10, top: 50, size: 80, rot: 0, op: 0.5 },
  { id: 2, left: 88, top: 37, size: 110, rot: 0, op: 0.6 },
];

const rem = (r) => r * 16;
const wrap = (i, n) => (i + n) % n;

export default function Card() {
  // ✅ Zustand
  const candidates = useMatchingStore((s) => s.candidates) || [];
  const setCandidates = useMatchingStore((s) => s.setCandidates);

  const N = candidates.length;

  // 문자열 길이의 절반 근처(공백/구두점 우선)에서 줄바꿈
  function breakAtHalf(text) {
    const raw = (text ?? "").trim();
    const arr = Array.from(raw); // 이모지/한글 안전
    const n = arr.length;
    if (n < 2) return raw;

    const mid = Math.floor(n / 2);
    const isBreak = (ch) => /\s|[.,!?;:·・\-—]/.test(ch);

    let idx = mid;
    // 절반 주변 8글자 범위에서 자연스러운 분할점 탐색
    for (let d = 0; d <= Math.min(8, n - 1); d++) {
      const L = mid - d, R = mid + d;
      if (L > 0 && isBreak(arr[L])) { idx = L + 1; break; }
      if (R < n - 1 && isBreak(arr[R])) { idx = R + 1; break; }
    }

    const head = arr.slice(0, idx).join("");
    const tail = arr.slice(idx).join("");
    return `${head}\n${tail}`;
  }

  // ✅ 훅들 최상단
  const [center, setCenter] = useState(0);
  const centerRef = useRef(center);
  useEffect(() => { centerRef.current = center; }, [center]);

  const [dx, setDx] = useState(0);
  const [snapping, setSnapping] = useState(false);
  const [dir, setDir] = useState("");
  const [loading, setLoading] = useState(false); // API 로딩

  const dragging = useRef(false);
  const lastX = useRef(0);

  // 후보가 0명이면 NoHuman
  if (N === 0) {
    return <NoHuman />;
  }

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

  // N=2 전용 좌우 배치
  const xTwoLeft = -SPREAD / 2 + dx;
  const xTwoRight = SPREAD / 2 + dx;
  const otherIdx = wrap(center + 1, N);

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
    if (N <= 1) return; // 1명 이하면 이동 안 함
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

  // 🔗 다시 매칭하기: 공용 api로 호출
  const handleRematch = async () => {
    try {
      setLoading(true);
      // baseURL/토큰/리트라이 등은 api 인스턴스에서 처리됨
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

      // 내부 상태 리셋
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
  const xFarLeft  = -2 * SPREAD + dx;
  const xLeft     = -1 * SPREAD + dx;
  const xCenter   =  0 * SPREAD + dx;
  const xRight    = +1 * SPREAD + dx;
  const xFarRight = +2 * SPREAD + dx;

  // 인덱스
  const idxFarLeft  = wrap(center - 2, N);
  const idxLeft     = wrap(center - 1, N);
  const idxRight    = wrap(center + 1, N);
  const idxFarRight = wrap(center + 2, N);

  const CardBody = ({ item = {} }) => {
    const {
      name = "이름 없음",
      department = "학과 없음",
      introduce = "소개 없음",
      typeImageUrl,
    } = item;
    const msgText = breakAtHalf(introduce);
    return (
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
          <img src={typeImageUrl || Img} alt={name} draggable={false} />
        </div>

        {/* 아치 내부 텍스트 */}
        <div className="arch" aria-hidden={false}>
          <div className="arch-content">
            <p className="name">{name}</p>
            <p className="major">{department}</p>
            <p className="msg">“{msgText}”</p>
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      <div className="title">원하는 상대에게 플러팅하세요</div>

      <div className="card-root">
        <div
          className={`card-wrap ${snapping ? "snapping" : ""} ${dir}`}
          onTouchStart={(e) => !hasOne && onStart(e.touches[0].clientX)}
          onTouchMove={(e)  => !hasOne && onMove(e.touches[0].clientX)}
          onTouchEnd={onEnd}
          onMouseDown={(e) => !hasOne && onStart(e.clientX)}
          onMouseMove={(e)  => !hasOne && onMove(e.clientX)}
          onMouseUp={onEnd}
          onMouseLeave={onEnd}
        >
          <> {/* 카드 지정 div */}
            {/* === N=1: 중앙 1장만 === */}
            {hasOne && (
              <div
                className="slot slot-center"
                style={{ transform: `translate(calc(-50% + ${xCenter}px), -50%)` }}
              >
                <div className="card">
                  <CardBody item={candidates[center]} />
                </div>
              </div>
            )}

            {/* === N=2: 딱 2장만 좌/우로 === */}
            {hasTwo && (
              <>
                <div
                  className="slot slot-left"
                  style={{ transform: `translate(calc(-50% + ${xTwoLeft}px), -50%)` }}
                >
                  <div className="card">
                    <CardBody item={candidates[center]} />
                  </div>
                </div>

                <div
                  className="slot slot-right"
                  style={{ transform: `translate(calc(-50% + ${xTwoRight}px), -50%)` }}
                >
                  <div className="card">
                    <CardBody item={candidates[otherIdx]} />
                  </div>
                </div>
              </>
            )}

            {/* === N>=3: 기존 5슬롯 === */}
            {hasThreePlus && (
              <>
                <div
                  className="slot slot-far-left"
                  style={{ transform: `translate(calc(-50% + ${xFarLeft}px), -50%)` }}
                >
                  <div className="card">
                    <CardBody item={candidates[idxFarLeft]} />
                  </div>
                </div>

                <div
                  className="slot slot-left"
                  style={{ transform: `translate(calc(-50% + ${xLeft}px), -50%)` }}
                >
                  <div className="card">
                    <CardBody item={candidates[idxLeft]} />
                  </div>
                </div>

                <div
                  className="slot slot-center"
                  style={{ transform: `translate(calc(-50% + ${xCenter}px), -50%)` }}
                >
                  <div className="card">
                    <CardBody item={candidates[center]} />
                  </div>
                </div>

                <div
                  className="slot slot-right"
                  style={{ transform: `translate(calc(-50% + ${xRight}px), -50%)` }}
                >
                  <div className="card">
                    <CardBody item={candidates[idxRight]} />
                  </div>
                </div>

                <div
                  className="slot slot-far-right"
                  style={{ transform: `translate(calc(-50% + ${xFarRight}px), -50%)` }}
                >
                  <div className="card">
                    <CardBody item={candidates[idxFarRight]} />
                  </div>
                </div>
              </>
            )}
          </>
        </div>

        {/* ⬇️ 카드 아래 둥근/와이드 버튼 */}
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
    </>
  );
}
