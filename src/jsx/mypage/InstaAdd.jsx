// src/components/common/InstaAdd.jsx
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import "../../css/mypage/InstaAdd.css";

export default function InstaAdd({
  onClose,
  onSave,
  defaultId = "",
  allowEmpty = true, // ✅ 빈값 저장(연결 해제) 허용
}) {
  const [instaId, setInstaId] = useState("");

  // 입력 정규화: URL/앞의 @/끝 슬래시 제거 → username만 남기기
  const normalize = (raw) => {
    if (!raw) return "";
    let s = String(raw).trim();
    if (!s) return "";

    // URL 형태면 username 추출
const m = s.match(/^https?:\/\/(www\.)?instagram\.com\/([^/?#]+)/i);    if (m && m[2]) s = m[2];

    // 앞의 @ 제거, 끝의 / 제거
    s = s.replace(/^@+/, "").replace(/\/+$/, "");
    return s;
  };

  // 모달 열릴 때 defaultId 정규화 반영
  useEffect(() => {
    setInstaId(normalize(defaultId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const value = normalize(instaId);

    // ❗ 기존: if (!instaId.trim()) return;  → 제거
    if (!value && !allowEmpty) {
      alert("인스타그램 아이디를 입력해주세요.");
      return;
    }

    onSave?.(value); // ✅ 빈 문자열이면 상위에서 '연결 해제'로 처리
    onClose?.();
  };

  const modal = (
    <div className="insta-modal-backdrop" role="dialog" aria-modal="true">
      <div className="insta-modal" role="document">
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
            인스타그램 아이디 또는 URL을 입력하세요{" "}
            <span className="hint">(비우면 해제)</span>
          </label>

          <div className="insta-input-wrapper">
            <span className="insta-prefix">@</span>
            <input
              id="insta-input"
              type="text"
              value={instaId}
              onChange={(e) => setInstaId(e.target.value)}
              placeholder="username 또는 https://instagram.com/username"
              autoFocus
            />
          </div>

          <div className="insta-actions">
            <button
              type="button"
              className="insta-cancel-btn"
              onClick={onClose}
            >
              취소
            </button>
            {/* 🔹 disabled 조건 없음: 빈값도 저장 가능 */}
            <button type="submit" className="insta-save-btn">
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
