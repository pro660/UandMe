// src/jsx/SentSignalList.jsx
import React, { useState, useEffect } from "react";
import "../../css/home/SentSignalList.css";
import YouProfile from "../mypage/YouProfile.jsx"; // 경로 확인

export default function SentSignalList({ signals /*, onOpenProfile */ }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  // ✅ 모달 열릴 때 배경 스크롤 잠금 (ChatRoom 느낌 유지)
  useEffect(() => {
    if (profileOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev || "auto";
      };
    }
  }, [profileOpen]);

  const formatRelativeTime = (isoString) => {
    if (!isoString) return "";
    const now = new Date();
    const date = new Date(isoString);
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return "방금 전";
    if (diffMin < 60) return `${diffMin}분 전`;
    if (diffHour < 24) return `${diffHour}시간 전`;
    if (diffDay === 1) return "어제";
    if (diffDay < 7) return `${diffDay}일 전`;
    return date.toLocaleDateString("ko-KR");
  };

  const handleOpen = (signal) => {
    if (signal.status === "DECLINED") return;
    const uid = signal.toUser?.userId;
    if (!uid) return;

    setSelectedUserId(uid);
    setProfileOpen(true);

    // ❗ ChatRoom 스타일로 내부 모달을 항상 사용
    // 만약 상위에서 onOpenProfile을 계속 쓰고 싶다면 여기서 호출 추가 가능
    // onOpenProfile?.(uid);
  };

  if (!signals || signals.length === 0) {
    return <div className="empty-message">보낸 신호가 없습니다.</div>;
  }

  return (
    <>
      <div className="sent-signal-list">
        {signals.map((signal) => {
          const isDeclined = signal.status === "DECLINED";

          return (
            <div
              key={signal.signalId}
              className={`sent-card ${isDeclined ? "sent-declined" : ""}`}
            >
              <div className="sent-info" onClick={() => handleOpen(signal)}>
                <div className="sent-profile-placeholder">
                  {signal.toUser?.typeImageUrl2 || signal.toUser?.typeImageUrl3 ? (
                    <img
                      src={signal.toUser.typeImageUrl2 || signal.toUser.typeImageUrl3}
                      alt="profile"
                      className="profile-img"
                    />
                  ) : null}
                </div>

                <div className="sent-text-info">
                  <strong>{signal.toUser?.name || "알 수 없는 유저"}</strong>
                  <span className="sent-department">
                    {signal.toUser?.department || "소속 없음"}
                  </span>
                  <span className="sent-status-badge">{signal.message}</span>
                  <span className="sent-created-at">
                    {formatRelativeTime(signal.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ✅ ChatRoom과 같은 마크업: modal-overlay / modal-content */}
      {profileOpen && selectedUserId && (
        <div
          className="modal-overlay"
          onClick={() => setProfileOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <YouProfile
              userId={selectedUserId}
              onClose={() => setProfileOpen(false)} // X 버튼 닫힘
            />
          </div>
        </div>
      )}
    </>
  );
}
