// src/jsx/SentSignalList.jsx
import React from "react";
import "../../css/home/SentSignalList.css";

export default function SentSignalList({ signals, onOpenProfile }) {
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

  if (!signals || signals.length === 0) {
    return <div className="empty-message">보낸 신호가 없습니다.</div>;
  }

  return (
    <div className="sent-signal-list">
      {signals.map((signal) => {
        const isDeclined = signal.status === "DECLINED";
        const userId = signal.toUser?.userId;

        return (
          <div
            key={signal.signalId}
            className={`sent-card ${isDeclined ? "sent-declined" : ""}`}
          >
            {/* ✅ DECLINED 아닐 때만 클릭 가능 */}
            <div
              className="sent-info"
              onClick={() => !isDeclined && userId && onOpenProfile(userId)}
            >
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
  );
}
