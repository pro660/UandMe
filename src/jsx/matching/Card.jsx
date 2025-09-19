// src/jsx/matching/Card.jsx
import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import api from "../../api/axios.js";
import "../../css/matching/Card.css";

import starImg from "../../image/matching/star.svg";
import useUserStore from "../../api/userStore";
import YouProfile from "../mypage/YouProfile.jsx";

const FIXED_STARS = [
  { id: 0, left: 26, top: 10, size: 100, rot: 0, op: 0.55 },
  { id: 1, left: 10, top: 50, size: 80, rot: 0.5, op: 0.5 },
  { id: 2, left: 88, top: 37, size: 110, rot: 0, op: 0.6 },
];

const rem = (r) => r * 16;
const wrap = (i, n) => (i + n) % n;
const getUid = (it) => it?.userId ?? it?.id ?? it?.targetUserId ?? null;
const normalizeList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.candidates)) return data.candidates;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

export default function Card({ initialCandidates = [] }) {
  // ✅ 외부 스토어 없이 내부에서만 관리
  const [candidates, setCandidates] = useState(() => initialCandidates);
  useEffect(() => {
    setCandidates(Array.isArray(initialCandidates) ? initialCandidates : []);
  }, [initialCandidates]);

  const { user, setUser } = useUserStore();
  const [selectedUserId, setSelectedUserId] = useState(null);

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
  const movedRef = useRef(false);
  const lastX = useRef(0);

  // 모달 열릴 때 body 스크롤 제어
  useEffect(() => {
    document.body.style.overflow = selectedUserId != null ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [selectedUserId]);

  const N = candidates.length;
  if (N === 0) return null; // 빈 배열이면 상위에서 Matching을 보여줌

  // 카드 배치 파라미터
  const CARD_W = rem(13);
  const GAP = rem(1.5);
  const SPREAD = CARD_W + GAP;
  const SNAP_MS = 260;
  const MAX_DRAG = CARD_W + GAP;

  const hasOne = N === 1;
  const hasTwo = N === 2;
  const hasThreePlus = N >= 3;

  const TWO_MULT = 0.5;
  const xTwoLeft = -SPREAD * TWO_MULT + dx;
  const xTwoRight = SPREAD * TWO_MULT + dx;
  const otherIdx = wrap(center + 1, N);

  // 드래그
  const onStart = (x) => {
    if (hasOne) return;
    dragging.current = true;
    movedRef.current = false;
    setSnapping(false);
    setDir("");
    lastX.current = x;
  };
  const onMove = (x) => {
    if (!dragging.current) return;
    const delta = x - lastX.current;
    lastX.current = x;
    setDx((prev) => {
      const next = Math.max(-MAX_DRAG, Math.min(MAX_DRAG, prev + delta));
      if (Math.abs(next) > 12) movedRef.current = true;
      return next;
    });
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
    setTimeout(() => {
      movedRef.current = false;
    }, SNAP_MS);
  };
  const completeSlide = (sign) => {
    if (N <= 1) return;
    setSnapping(true);
    setDir(sign < 0 ? "dir-left" : "dir-right");
    setDx(sign * SPREAD);
    setTimeout(() => {
      const nextCenter =
        sign < 0
          ? wrap(centerRef.current + 1, N)
          : wrap(centerRef.current - 1, N);
      setCenter(nextCenter);
      setSnapping(false);
      setDx(0);
      setDir("");
    }, SNAP_MS);
  };

  // 다시 매칭: API로 새 목록 교체(크레딧 차감은 userStore만 사용)
  const handleRematch = async () => {
    const credits = user?.matchCredits ?? 0;
    if (credits <= 0) {
      alert("매칭 기회가 없습니다!");
      return;
    }
    try {
      setLoading(true);
      const res = await api.post("/match/start", {});
      const nextList = normalizeList(res?.data);

      if (!nextList.length) {
        alert("매칭할 상대가 없습니다. 크레딧은 차감되지 않았습니다.");
        return;
      }

      setCandidates(nextList);

      // 안전 차감
      setUser((prev) => ({
        ...prev,
        matchCredits: Math.max(0, (prev?.matchCredits ?? 0) - 1),
      }));

      // 위치/상태 초기화
      setCenter(0);
      setDx(0);
      setSnapping(false);
      setDir("");
    } catch (err) {
      console.error("❌ 매칭 시작 요청 실패:", err);
      alert(err?.response?.data?.message || "매칭을 다시 시작할 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 카드 내부 렌더
  const breakAtHalf = (text) => {
    const raw = (text ?? "").trim();
    const arr = Array.from(raw);
    const n = arr.length;
    if (n < 2) return raw;
    const mid = Math.floor(n / 2);
    const isBreak = (ch) => /\s|[.,!?;:·・\-—]/.test(ch);
    let idx = mid;
    for (let d = 0; d <= Math.min(8, n - 1); d++) {
      if (mid - d > 0 && isBreak(arr[mid - d])) {
        idx = mid - d + 1;
        break;
      }
      if (mid + d < n - 1 && isBreak(arr[mid + d])) {
        idx = mid + d + 1;
        break;
      }
    }
    return arr.slice(0, idx).join("") + "\n" + arr.slice(idx).join("");
  };

  // ⬇️ Card.jsx 안의 CardBody 만 이 코드로 교체
  const CardBody = ({ item = {} }) => {
    const {
      name = "이름 없음",
      department = "학과 없음",
      introduce = "소개 없음",
      profileImageUrl, // ✅ 1순위
      typeImageUrl, // ✅ 2순위
    } = item;

    // 소개 줄바꿈 기존 로직 재사용
    const msgText = breakAtHalf(introduce ?? "");

    // 이미지 소스 우선순위 + 에러 폴백
    const primary = (profileImageUrl ?? "").trim() || null;
    const fallback = (typeImageUrl ?? "").trim() || null;

    const [imgSrc, setImgSrc] = useState(primary || fallback || null);
    useEffect(() => {
      // item 바뀌면 우선순위 다시 계산
      setImgSrc(primary || fallback || null);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [primary, fallback]);

    const handleImgError = () => {
      if (imgSrc && imgSrc !== fallback && fallback) {
        // 프로필(1순위) 실패 → 타입이미지(2순위)로 교체
        setImgSrc(fallback);
      } else {
        // 둘 다 실패 → 플레이스홀더
        setImgSrc(null);
      }
    };

    return (
      <>
        <div
          className="card-stars"
          aria-hidden="true"
          style={{ pointerEvents: "none" }}
        >
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

        <div className="img-frame">
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={name}
              draggable={false}
              loading="lazy"
              decoding="async"
              onError={handleImgError}
            />
          ) : (
            // ✅ 이미지가 전혀 없거나 모두 실패했을 때
            <div className="img-placeholder" aria-hidden="true">
              {/* 필요하면 이 안에 아이콘/이니셜 등 넣어도 됨 */}
            </div>
          )}
        </div>

        <div className="arch">
          <div className="arch-content">
            <p className="name">{name}</p>
            <p className="major">{department}</p>
            <p className="msg">“{msgText}”</p>
          </div>
        </div>
      </>
    );
  };

  // 슬롯 좌표
  const xFarLeft = -2 * SPREAD + dx;
  const xLeft = -1 * SPREAD + dx;
  const xCenter = 0 * SPREAD + dx;
  const xRight = 1 * SPREAD + dx;
  const xFarRight = 2 * SPREAD + dx;

  const idxFarLeft = wrap(center - 2, N);
  const idxLeft = wrap(center - 1, N);
  const idxRight = wrap(center + 1, N);
  const idxFarRight = wrap(center + 2, N);

  const handleCardClick = (item) => (e) => {
    e.stopPropagation();
    if (movedRef.current) return;
    const uid = getUid(item);
    if (uid != null) setSelectedUserId(uid);
  };

  return (
    <>
      <div className="title">프로필 사진을 눌러 <br/> 원하는 상대에게 플러팅하세요</div>

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
              <div
                className="card"
                onClick={handleCardClick(candidates[center])}
              >
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
                  zIndex: 2,
                }}
              >
                <div
                  className="card"
                  onClick={handleCardClick(candidates[center])}
                >
                  <CardBody item={candidates[center]} />
                </div>
              </div>
              <div
                className="slot slot-right"
                style={{
                  transform: `translate(calc(-50% + ${xTwoRight}px), -50%)`,
                  zIndex: 1,
                }}
              >
                <div
                  className="card"
                  onClick={handleCardClick(candidates[otherIdx])}
                >
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
                <div
                  className="card"
                  onClick={handleCardClick(candidates[idxFarLeft])}
                >
                  <CardBody item={candidates[idxFarLeft]} />
                </div>
              </div>
              <div
                className="slot slot-left"
                style={{
                  transform: `translate(calc(-50% + ${xLeft}px), -50%)`,
                }}
              >
                <div
                  className="card"
                  onClick={handleCardClick(candidates[idxLeft])}
                >
                  <CardBody item={candidates[idxLeft]} />
                </div>
              </div>
              <div
                className="slot slot-center"
                style={{
                  transform: `translate(calc(-50% + ${xCenter}px), -50%)`,
                }}
              >
                <div
                  className="card"
                  onClick={handleCardClick(candidates[center])}
                >
                  <CardBody item={candidates[center]} />
                </div>
              </div>
              <div
                className="slot slot-right"
                style={{
                  transform: `translate(calc(-50% + ${xRight}px), -50%)`,
                }}
              >
                <div
                  className="card"
                  onClick={handleCardClick(candidates[idxRight])}
                >
                  <CardBody item={candidates[idxRight]} />
                </div>
              </div>
              <div
                className="slot slot-far-right"
                style={{
                  transform: `translate(calc(-50% + ${xFarRight}px), -50%)`,
                }}
              >
                <div
                  className="card"
                  onClick={handleCardClick(candidates[idxFarRight])}
                >
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

      {/* 상세 모달: 프로필 + 플러팅하기 버튼 */}
      {selectedUserId != null &&
        createPortal(
          <div
            className="modal-overlay"
            onClick={() => setSelectedUserId(null)}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <YouProfile
                userId={selectedUserId}
                onClose={() => setSelectedUserId(null)}
                fromMatching={true}
              />
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
