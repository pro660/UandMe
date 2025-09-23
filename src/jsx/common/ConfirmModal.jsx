// src/jsx/common/ConfirmModal.jsx
import React, { useEffect } from "react";
import "../../css/common/ConfirmModal.css";

// 상대 시간 포맷 (옵션)
function formatRelativeTime(timestamp) {
  const now = Date.now();
  const past = new Date(timestamp).getTime();
  const diff = Math.floor((now - past) / 1000);
  if (diff < 60) return `${diff}초 전`;
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}일 전`;
  return new Date(timestamp).toLocaleDateString();
}

export default function ConfirmModal({
  open,
  onClose,
  onAccept,
  onReject,
  user,
  title = "확인",
  message = "이 작업을 진행하시겠습니까?",
  showUser = true,
  acceptText = "수락",
  rejectText = "거절",
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = prev);
  }, [open]);

  if (!open) return null;

  const onOverlayClick = (e) => {
    if (e.target.classList.contains("confirm-overlay")) onClose?.();
  };

  return (
    <div
      className="confirm-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-message"
      onClick={onOverlayClick}
    >
      <div className="confirm-modal">
        <div className="confirm-header">
          <span id="confirm-title">{title}</span>
          <button className="close-btn" onClick={onClose} aria-label="닫기">✕</button>
        </div>

        <div className="confirm-body">
          {showUser && user && (
            <>
              {user.avatar ? (
                <img src={user.avatar} alt="profile" className="profile-img" />
              ) : (
                <div className="profile-placeholder" />
              )}
              <h3>{user.name}</h3>
              <p className="department">{user.department || "소속 없음"}</p>
              {user.createdAt && (
                <p className="created-at">보낸 시각: {formatRelativeTime(user.createdAt)}</p>
              )}
            </>
          )}
          <p className="question" id="confirm-message">{message}</p>
        </div>

        <div className="confirm-actions">
          <button className="reject-btn" onClick={onReject}>{rejectText}</button>
          <button className="accept-btn" onClick={onAccept}>{acceptText}</button>
        </div>
      </div>
    </div>
  );
}