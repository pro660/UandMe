// src/jsx/Accept.jsx
import React from "react";
import "../../css/home/Accept.css";

export default function Accept({ open, onClose, onAccept, onReject, user }) {
  if (!open) return null;

  return (
    <div className="accept-overlay">
      <div className="accept-modal">
        <div className="accept-header">
          <span>매칭 확인</span>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="accept-body">
          {user.avatar ? (
            <img src={user.avatar} alt="profile" className="profile-img" />
          ) : (
            <div className="profile-placeholder" />
          )}
          <h3>{user.name}</h3>
          <p className="department">{user.department || "소속 없음"}</p>
          {user.createdAt && (
            <p className="created-at">보낸 시각: {user.createdAt}</p>
          )}
          <p className="question">플러팅을 수락하시겠습니까?</p>
        </div>

        <div className="accept-actions">
          <button className="reject-btn" onClick={onReject}>
            거절
          </button>
          <button className="accept-btn" onClick={onAccept}>
            수락
          </button>
        </div>
      </div>
    </div>
  );
}
