// src/components/common/InstaAdd.jsx
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import "../../css/mypage/InstaAdd.css";

export default function InstaAdd({ onClose, onSave, defaultId = "" }) {
  const [instaId, setInstaId] = useState(defaultId);

  // 모달이 열릴 때 defaultId가 변경되면 값 반영
  useEffect(() => {
    setInstaId(defaultId || "");
  }, [defaultId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!instaId.trim()) return;
    if (onSave) onSave(instaId.trim());
    if (onClose) onClose(); // 저장 후 닫기
  };

  const modal = (
    <div className="insta-modal-backdrop">
      <div className="insta-modal">
        {/* 헤더 */}
        <div className="insta-modal-header">
          <h2>인스타그램을 추가하세요</h2>
          <button
            type="button"
            className="insta-close-btn"
            onClick={onClose}
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        {/* 본문 */}
        <form className="insta-modal-body" onSubmit={handleSubmit}>
          <label htmlFor="insta-input" className="insta-label">
            인스타그램 아이디를 입력하세요.
          </label>

          <div className="insta-input-wrapper">
            <span className="insta-prefix">@</span>
            <input
              id="insta-input"
              type="text"
              value={instaId}
              onChange={(e) => setInstaId(e.target.value)}
              placeholder="username"
            />
          </div>

          <button type="submit" className="insta-save-btn">
            저장
          </button>
        </form>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
