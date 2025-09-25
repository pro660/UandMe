// src/jsx/matching/Card.jsx
import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import api from "../../api/axios.js";
import "../../css/matching/Card.css";

import starImg from "../../image/matching/star.svg";
import useUserStore from "../../api/userStore";
import YouProfile from "../mypage/YouProfile.jsx";
import ConfirmModal from "../common/ConfirmModal.jsx"; // ✅ 공통 컨펌 모달

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
  const [candidates, setCandidates] = useState(() => initialCandidates);
  useEffect(() => {
    setCandidates(Array.isArray(initialCandidates) ? initialCandidates : []);
  }, [initialCandidates]);

  const { user } = useUserStore();
  const [selectedUserId, setSelectedUserId] = useState(null);

  // ✅ 공통 컨펌 모달 상태
  const [confirm, setConfirm] = useState(null);
  const openConfirm = (opts) =>
    setConfirm({
      open: true,
      title: "확인",
      message: "진행하시겠습니까?",
      acceptText: "매칭하기",
      rejectText: "취소",
      showUser: false,
      user: null,
      onAccept: null,
      onReject: null,
      ...opts,
    });

  // 카드 가로 스와이프 상태
  const [center, setCenter] = useState(0);
  const centerRef = useRef(center);
  useEffect(() => {
    centerRef.current = center;
  }, [center]);

  const [dx, setDx] = useState(0);
  const [snapping, setSnapping] = useState(false);
  const [dir, setDir] = useState("");
  const [loading, setLoading] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const dragging = useRef(false);
  const movedRef = useRef(false);
  const lastX = useRef(0);

  useEffect(() => {
    document.body.style.overflow = selectedUserId != null ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [selectedUserId]);

  const N = candidates.length;
  if (N === 0) return null;

  // 카드 배치 파라미터
  const CARD_W = rem(13);
  const GAP = rem(1.5);
  const SPREAD = CARD_W + GAP;
  const SNAP_MS = 260;
  const MAX_DRAG = CARD_W + GAP;

  const hasOne = N === 1;
  const hasTwo = N === 2;
  const hasThreePlus = N >= 3;
  const swipeEnabled = hasThreePlus;

  const TWO_MULT = 0.5;
  const xTwoLeft = -SPREAD * TWO_MULT + dx;
  const xTwoRight = SPREAD * TWO_MULT + dx;
  const otherIdx = wrap(center + 1, N);

  // 드래그 제스처
  const onStart = (x) => {
    if (!swipeEnabled) return;
    dragging.current = true;
    setIsDragging(true);
    movedRef.current = false;
    setSnapping(false);
    setDir("");
    lastX.current = x;
  };
  const onMove = (x) => {
    if (!dragging.current || !swipeEnabled) return;
    const delta = x - lastX.current;
    lastX.current = x;
    setDx((prev) => {
      const next = Math.max(-MAX_DRAG, Math.min(MAX_DRAG, prev + delta));
      if (Math.abs(next) > 12) movedRef.current = true;
      return next;
    });
  };
  const onEnd = () => {
    if (!dragging.current || !swipeEnabled) return;
    dragging.current = false;
    setIsDragging(false);

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
    if (!swipeEnabled) return;
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

  // 다시 매칭
  const doRematch = async () => {
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
      try {
        const refreshed = await api.get("/users/me/profile");
        if (refreshed?.data) {
          useUserStore.getState().updateUser(refreshed.data);
        }
      } catch {}
      setCenter(0);
      setDx(0);
      setSnapping(false);
      setDir("");
    } catch (err) {
      alert(err?.response?.data?.message || "매칭을 다시 시작할 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  const openRematchConfirm = () => {
    const credits = user?.matchCredits ?? 0;
    if (credits <= 0) {
      alert("매칭 기회가 없습니다!");
      return;
    }
    openConfirm({
      title: "다시 매칭하기",
      message: `매칭 기회를 사용하여 새로운 상대를 찾습니다.\n현재 보유: ${credits}회\n매칭하시겠습니까?`,
      acceptText: "매칭하기",
      rejectText: "취소",
      onAccept: async () => {
        setConfirm(null);
        await doRematch();
      },
      onReject: () => setConfirm(null),
    });
  };

  const sendFlirt = async (targetUserId) => {
    try {
      await api.post(`/signals/${targetUserId}`);
      alert("플러팅을 보냈어요!");
    } catch (err) {
      alert(err?.response?.data?.message || "플러팅을 보낼 수 없습니다.");
    }
  };

  const handleRequestFlirt = (targetUserId, targetName, avatar) => {
    if (!targetUserId) return;
    openConfirm({
      title: "플러팅 확인",
      message: `${targetName ?? "상대"}님께 플러팅을 보내시겠습니까?`,
      acceptText: "보내기",
      rejectText: "취소",
      showUser: !!(targetName || avatar),
      user: targetName ? { name: targetName, avatar } : null,
      onAccept: async () => {
        setConfirm(null);
        await sendFlirt(targetUserId);
      },
      onReject: () => setConfirm(null),
    });
  };

  // ✅ introduce는 자연스럽게 그대로 표시
  const CardBody = ({ item = {} }) => {
    const {
      name = "이름 없음",
      department = "학과 없음",
      introduce = "소개 없음",
      typeImageUrl2,
    } = item;

    const currentSrc = (typeImageUrl2 ?? "").trim() || null;

    return (
      <>
        <div className="card-stars" aria-hidden="true" style={{ pointerEvents: "none" }}>
          {FIXED_STARS.map((s) => (
            <img
              key={s.id}
              src={starImg}
              alt=""
              className="star"
              draggable={false}
              decoding="async"
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

        <div className="img-wrap">
          {currentSrc ? (
            <img
              className="img-frame"
              src={currentSrc}
              alt={name}
              draggable={false}
              loading="eager"
              decoding="async"
            />
          ) : (
            <div className="img-frame" aria-hidden="true" />
          )}
        </div>

        <div className="arch">
          <div className="arch-content">
            <p className="name">{name}</p>
            <p className="major">{department}</p>
            <p className="msg">{introduce ?? "소개 없음"}</p>
          </div>
        </div>
      </>
    );
  };

  // 위치 계산
  const xFarLeft = -2 * SPREAD + dx;
  const xLeft = -1 * SPREAD + dx;
  const xCenter = dx;
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

  const t3d = (px) => `translate3d(calc(-50% + ${px}px), -50%, 0)`;

  return (
    <>
      <div className="title">
        프로필 사진을 눌러 <br /> 원하는 상대에게 플러팅하세요
      </div>

      <div className="card-root">
        <div
          className={`card-wrap ${snapping ? "snapping" : ""} ${dir} ${isDragging ? "dragging" : ""}`}
          onTouchStartCapture={(e) => swipeEnabled && onStart(e.touches[0].clientX)}
          onTouchMoveCapture={(e) => swipeEnabled && onMove(e.touches[0].clientX)}
          onTouchEndCapture={swipeEnabled ? onEnd : undefined}
          onMouseDownCapture={(e) => swipeEnabled && onStart(e.clientX)}
          onMouseMoveCapture={(e) => swipeEnabled && onMove(e.clientX)}
          onMouseUpCapture={swipeEnabled ? onEnd : undefined}
          onMouseLeaveCapture={swipeEnabled ? onEnd : undefined}
        >
          {/* === N=1 === */}
          {hasOne && (
            <div
              key={getUid(candidates[center])}
              className="slot slot-center"
              style={{ transform: t3d(xCenter) }}
            >
              <div className="card" onClick={handleCardClick(candidates[center])}>
                <CardBody item={candidates[center]} />
              </div>
            </div>
          )}

          {/* === N=2 === */}
          {hasTwo && (
            <>
              <div
                key={getUid(candidates[center])}
                className="slot slot-left"
                style={{ transform: t3d(xTwoLeft), zIndex: 2 }}
              >
                <div className="card" onClick={handleCardClick(candidates[center])}>
                  <CardBody item={candidates[center]} />
                </div>
              </div>
              <div
                key={getUid(candidates[otherIdx])}
                className="slot slot-right"
                style={{ transform: t3d(xTwoRight), zIndex: 1 }}
              >
                <div className="card" onClick={handleCardClick(candidates[otherIdx])}>
                  <CardBody item={candidates[otherIdx]} />
                </div>
              </div>
            </>
          )}

          {/* === N>=3 === */}
          {hasThreePlus && (
            <>
              <div
                key={getUid(candidates[idxFarLeft])}
                className="slot slot-far-left"
                style={{ transform: t3d(xFarLeft) }}
              >
                <div className="card" onClick={handleCardClick(candidates[idxFarLeft])}>
                  <CardBody item={candidates[idxFarLeft]} />
                </div>
              </div>
              <div
                key={getUid(candidates[idxLeft])}
                className="slot slot-left"
                style={{ transform: t3d(xLeft) }}
              >
                <div className="card" onClick={handleCardClick(candidates[idxLeft])}>
                  <CardBody item={candidates[idxLeft]} />
                </div>
              </div>
              <div
                key={getUid(candidates[center])}
                className="slot slot-center"
                style={{ transform: t3d(xCenter) }}
              >
                <div className="card" onClick={handleCardClick(candidates[center])}>
                  <CardBody item={candidates[center]} />
                </div>
              </div>
              <div
                key={getUid(candidates[idxRight])}
                className="slot slot-right"
                style={{ transform: t3d(xRight) }}
              >
                <div className="card" onClick={handleCardClick(candidates[idxRight])}>
                  <CardBody item={candidates[idxRight]} />
                </div>
              </div>
              <div
                key={getUid(candidates[idxFarRight])}
                className="slot slot-far-right"
                style={{ transform: t3d(xFarRight) }}
              >
                <div className="card" onClick={handleCardClick(candidates[idxFarRight])}>
                  <CardBody item={candidates[idxFarRight]} />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="cta-wrap">
          <button type="button" className="cta-btn" onClick={openRematchConfirm} disabled={loading}>
            {loading ? "매칭 시작 중..." : "다시 매칭하기"}
          </button>
        </div>
      </div>

      {selectedUserId != null &&
        createPortal(
          <div className="modal-overlay" onClick={() => setSelectedUserId(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <YouProfile
                userId={selectedUserId}
                onClose={() => setSelectedUserId(null)}
                fromMatching={true}
                onRequestFlirt={(targetId, targetName, avatar) =>
                  handleRequestFlirt(targetId, targetName, avatar)
                }
              />
            </div>
          </div>,
          document.body
        )}

      {confirm?.open && (
        <ConfirmModal
          open
          onClose={() => setConfirm(null)}
          onAccept={async () => {
            try {
              await confirm.onAccept?.();
            } finally {
              setConfirm((prev) => (prev?.open ? null : prev));
            }
          }}
          onReject={() => {
            confirm.onReject?.();
            setConfirm(null);
          }}
          title={confirm.title}
          message={confirm.message}
          acceptText={confirm.acceptText}
          rejectText={confirm.rejectText}
          showUser={confirm.showUser}
          user={confirm.user}
        />
      )}
    </>
  );
}