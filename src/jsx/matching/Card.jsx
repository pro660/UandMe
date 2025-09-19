import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import api from "../../api/axios.js";
import "../../css/matching/Card.css";

import useMatchingStore from "../../api/matchingStore";
import useUserStore from "../../api/userStore";
import NoHuman from "./Nohuman";
import YouProfile from "../mypage/YouProfile.jsx";

const rem = (r) => r * 16;
const wrap = (i, n) => (i + n) % n;
const getUid = (it) => it?.userId ?? it?.id ?? it?.targetUserId ?? null;

const getMsg = (t) => {
  const raw = (t ?? "").trim();
  const arr = Array.from(raw);
  const n = arr.length;
  if (n < 2) return raw;
  const mid = Math.floor(n / 2);
  const isBreak = (ch) => /\s|[.,!?;:·・\-—]/.test(ch);
  let idx = mid;
  for (let d = 0; d <= Math.min(8, n - 1); d++) {
    if (mid - d > 0 && isBreak(arr[mid - d])) { idx = mid - d + 1; break; }
    if (mid + d < n - 1 && isBreak(arr[mid + d])) { idx = mid + d + 1; break; }
  }
  return arr.slice(0, idx).join("") + "\n" + arr.slice(idx).join("");
};

// 슬롯별 회전 각도 (deg 단위는 CSS에서 곱해짐)
const rotMap = {
  farLeft: -25, left: -15, center: 0, right: 12, farRight: 25,
};
const rot2 = { left: -10, right: 10 };

export default function Card() {
  const candidates = useMatchingStore((s) => s.candidates) || [];
  const setCandidates = useMatchingStore((s) => s.setCandidates);
  const { user, setUser } = useUserStore();

  const [selectedUserId, setSelectedUserId] = useState(null);
  const N = candidates.length;

  // 모달 열릴 때 body 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = selectedUserId != null ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [selectedUserId]);

  // 캐러셀 상태
  const [center, setCenter] = useState(0);
  const centerRef = useRef(center);
  useEffect(() => { centerRef.current = center; }, [center]);

  const [dx, setDx] = useState(0);
  const [snapping, setSnapping] = useState(false);
  const [dir, setDir] = useState("");
  const [loading, setLoading] = useState(false);
  const dragging = useRef(false);
  const movedRef = useRef(false);
  const lastX = useRef(0);

  if (N === 0) return <NoHuman />;

  // 기하
  const CARD_W = rem(13);
  const GAP = rem(1.5);
  const SPREAD = CARD_W + GAP;
  const SNAP_MS = 260;
  const MAX_DRAG = SPREAD;

  // 분기
  const hasOne = N === 1;
  const hasTwo = N === 2;
  const hasThreePlus = N >= 3;

  // N=2 간격(타이트)
  const TWO_MULT = 0.55;
  const xTwoLeft = -SPREAD * TWO_MULT + dx;
  const xTwoRight = SPREAD * TWO_MULT + dx;
  const otherIdx = wrap(center + 1, N);

  // 드래그
  const onStart = (x) => {
    if (hasOne) return;
    dragging.current = true;
    movedRef.current = false;
    setSnapping(false); setDir("");
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
      setSnapping(true); setDx(0);
      setTimeout(() => setSnapping(false), SNAP_MS);
    }
    setTimeout(() => { movedRef.current = false; }, SNAP_MS);
  };
  const completeSlide = (sign) => {
    if (N <= 1) return;
    setSnapping(true);
    setDir(sign < 0 ? "dir-left" : "dir-right");
    setDx(sign * SPREAD);
    setTimeout(() => {
      const nextCenter = sign < 0 ? wrap(centerRef.current + 1, N)
                                  : wrap(centerRef.current - 1, N);
      setCenter(nextCenter);
      setSnapping(false); setDx(0); setDir("");
    }, SNAP_MS);
  };

  // 다시 매칭
  const handleRematch = async () => {
    if (user?.matchCredits <= 0) { alert("매칭 기회가 없습니다!"); return; }
    try {
      setLoading(true);
      const res = await api.post("/match/start", {});
      const payload = res?.data;
      const nextList = Array.isArray(payload) ? payload
        : Array.isArray(payload?.candidates) ? payload.candidates : [];
      setCandidates?.(nextList);
      setUser({ ...user, matchCredits: Math.max(0, (user?.matchCredits ?? 0) - 1) });
      setCenter(0); setDx(0); setSnapping(false); setDir("");
      if (!nextList.length) alert("새 매칭 결과가 없습니다.");
    } catch (e) {
      console.error(e);
      alert("매칭 시작 요청에 실패했습니다.");
    } finally { setLoading(false); }
  };

  // 공용 카드 클릭
  const handleCardClick = (item) => (e) => {
    e.stopPropagation();
    if (movedRef.current) return; // 드래그 → 클릭 무시
    const uid = getUid(item);
    if (uid != null) setSelectedUserId(uid);
  };

  // 콘텐츠 (이미지/텍스트)
  const GlassContent = ({ item = {} }) => {
    const {
      name = "이름 없음",
      department = "학과 없음",
      introduce = "",
      typeImageUrl,
    } = item;
    const msgText = getMsg(introduce ?? "");
    return (
      <div className="glass-content">
        <div className="glass-image">
          {typeImageUrl ? <img src={typeImageUrl} alt={name} draggable={false} />
                        : <div className="glass-image--placeholder" />}
        </div>
        <div className="glass-text">
          <p className="glass-name">{name}</p>
          <p className="glass-major">{department}</p>
          {msgText && <p className="glass-msg">“{msgText}”</p>}
        </div>
      </div>
    );
  };

  // 좌표 인덱스
  const xFarLeft  = -2 * SPREAD + dx;
  const xLeft     = -1 * SPREAD + dx;
  const xCenter   =  0 * SPREAD + dx;
  const xRight    = +1 * SPREAD + dx;
  const xFarRight = +2 * SPREAD + dx;

  const idxFarLeft  = wrap(center - 2, N);
  const idxLeft     = wrap(center - 1, N);
  const idxRight    = wrap(center + 1, N);
  const idxFarRight = wrap(center + 2, N);

  return (
    <>
      <div className="title">원하는 상대에게 플러팅하세요</div>

      <div className="card-root">
        {/* hover 시 회전이 풀리도록 컨테이너 클래스 부여 */}
        <div
          className={`card-wrap glass-container ${snapping ? "snapping" : ""} ${dir}`}
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
              style={{ transform: `translate(calc(-50% + ${xCenter}px), -50%)` }}
            >
              <div
                className="glass"
                data-text={candidates[center]?.name ?? ""}
                style={{ "--r": rotMap.center }}
                onClick={handleCardClick(candidates[center])}
              >
                <GlassContent item={candidates[center]} />
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
                  className="glass"
                  data-text={candidates[center]?.name ?? ""}
                  style={{ "--r": rot2.left }}
                  onClick={handleCardClick(candidates[center])}
                >
                  <GlassContent item={candidates[center]} />
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
                  className="glass"
                  data-text={candidates[otherIdx]?.name ?? ""}
                  style={{ "--r": rot2.right }}
                  onClick={handleCardClick(candidates[otherIdx])}
                >
                  <GlassContent item={candidates[otherIdx]} />
                </div>
              </div>
            </>
          )}

          {/* === N>=3 === */}
          {hasThreePlus && (
            <>
              <div
                className="slot slot-far-left"
                style={{ transform: `translate(calc(-50% + ${xFarLeft}px), -50%)` }}
              >
                <div
                  className="glass"
                  data-text={candidates[idxFarLeft]?.name ?? ""}
                  style={{ "--r": rotMap.farLeft }}
                  onClick={handleCardClick(candidates[idxFarLeft])}
                >
                  <GlassContent item={candidates[idxFarLeft]} />
                </div>
              </div>

              <div
                className="slot slot-left"
                style={{ transform: `translate(calc(-50% + ${xLeft}px), -50%)` }}
              >
                <div
                  className="glass"
                  data-text={candidates[idxLeft]?.name ?? ""}
                  style={{ "--r": rotMap.left }}
                  onClick={handleCardClick(candidates[idxLeft])}
                >
                  <GlassContent item={candidates[idxLeft]} />
                </div>
              </div>

              <div
                className="slot slot-center"
                style={{ transform: `translate(calc(-50% + ${xCenter}px), -50%)` }}
              >
                <div
                  className="glass"
                  data-text={candidates[center]?.name ?? ""}
                  style={{ "--r": rotMap.center }}
                  onClick={handleCardClick(candidates[center])}
                >
                  <GlassContent item={candidates[center]} />
                </div>
              </div>

              <div
                className="slot slot-right"
                style={{ transform: `translate(calc(-50% + ${xRight}px), -50%)` }}
              >
                <div
                  className="glass"
                  data-text={candidates[idxRight]?.name ?? ""}
                  style={{ "--r": rotMap.right }}
                  onClick={handleCardClick(candidates[idxRight])}
                >
                  <GlassContent item={candidates[idxRight]} />
                </div>
              </div>

              <div
                className="slot slot-far-right"
                style={{ transform: `translate(calc(-50% + ${xFarRight}px), -50%)` }}
              >
                <div
                  className="glass"
                  data-text={candidates[idxFarRight]?.name ?? ""}
                  style={{ "--r": rotMap.farRight }}
                  onClick={handleCardClick(candidates[idxFarRight])}
                >
                  <GlassContent item={candidates[idxFarRight]} />
                </div>
              </div>
            </>
          )}
        </div>

        {/* CTA */}
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

      {/* 모달 */}
      {selectedUserId != null &&
        createPortal(
          <div className="modal-overlay" onClick={() => setSelectedUserId(null)}>
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
