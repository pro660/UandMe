// src/jsx/ReceiveSignal.jsx
import React from "react";
import "../../css/home/ReceiveSignal.css";

export default function ReceiveSignal({ signals, onAccept, onReject, onOpenProfile }) {
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
    return <div className="empty-message">받은 신호가 없습니다.</div>;
  }

  return (
    <div className="receive-signal-list">
      {signals.map((signal) => {
        const isDeclined = signal.status === "DECLINED";
        const userId = signal.fromUser?.userId;

        return (
          <div
            key={signal.signalId}
            className={`receive-card ${isDeclined ? "receive-declined" : ""}`}
          >
            {/* ✅ DECLINED 아닐 때만 클릭 가능 */}
            <div
              className="receive-info"
              onClick={() => !isDeclined && userId && onOpenProfile(userId)}
            >
              <div className="profile-placeholder">
                {signal.fromUser?.typeImageUrl2 && (
                  <img
                    src={signal.fromUser.typeImageUrl2}
                    alt="profile"
                    className="profile-img"
                  />
                )}
              </div>
              <div className="receive-text-info">
                <strong>{signal.fromUser?.name || "알 수 없는 유저"}</strong>
                <span className="receive-department">
                  {signal.fromUser?.department || "소속 없음"}
                </span>
                <span className="receive-status-badge">{signal.message}</span>
                <span className="receive-created-at">
                  {formatRelativeTime(signal.createdAt)}
                </span>
              </div>
            </div>

            <div className="receive-actions">
              {signal.status === "SENT" && (
                <button
                  className="receive-accept-btn"
                  onClick={() => onAccept(signal.signalId)}
                >
                  ❤️
                </button>
              )}
              {signal.status === "DECLINED" && (
                <button
                  className="receive-reject-btn"
                  onClick={() => onReject(signal.signalId)}
                >
                  🗑
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
