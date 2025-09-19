// src/jsx/SentSignalList.jsx
import React, { useState } from "react";
import "../../css/home/SentSignalList.css";
import YouProfile from "../mypage/YouProfile.jsx"; // ✅ 경로 프로젝트에 맞게 수정

export default function SentSignalList({ signals, onOpenProfile }) {
  // ✅ 모달 상태
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null); // 초기 렌더용(옵션)

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
    const isDeclined = signal.status === "DECLINED";
    const uid = signal.toUser?.userId;
    if (isDeclined || !uid) return;

    // 부모가 onOpenProfile을 넘겨줬다면 그대로 위임 (호환성 유지)
    if (typeof onOpenProfile === "function") {
      onOpenProfile(uid);
      return;
    }

    // ✅ 내부 모달 오픈
    setSelectedUserId(uid);
    setSelectedUser(signal.toUser || null); // 초기 데이터 전달(YouProfile이 추가 fetch 해도 OK)
    setProfileOpen(true);
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
              {/* ✅ DECLINED 아닐 때만 클릭 가능 */}
              <div
                className="sent-info"
                onClick={() => handleOpen(signal)}
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

      {/* ✅ 내부에서 띄우는 YouProfile 모달 (부모에서 onOpenProfile 안 넘긴 경우에만) */}
      {typeof onOpenProfile !== "function" && (
        <YouProfile
          open={profileOpen}
          onClose={() => setProfileOpen(false)}
          userId={selectedUserId}          // 서버에서 상세 fetch 하는 컴포넌트라면 이걸 사용
          initialUser={selectedUser}       // 선택: 초깃값으로 미리 채우기(컴포넌트 prop 이름 맞춰 변경)
        />
      )}
    </>
  );
}
