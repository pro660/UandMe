// src/components/QuitForm.jsx
import React, { useEffect, useRef } from "react";
import "../../css/mypage/QuitForm.css";

export default function QuitForm({
  open = false,
  onConfirm,
  onCancel,
  loading = false,
}) {
  const dialogRef = useRef(null);

  // ESC로 닫기
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onCancel?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  const stop = (e) => e.stopPropagation();

  return (
    <div className="quitform-backdrop" onClick={onCancel}>
      <section
        className="quitform"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quitform-heading"
        aria-describedby="quitform-desc"
        onClick={stop}
      >
        <header className="quitform__header">회원탈퇴</header>

        <div className="quitform__body">
          <h2 id="quitform-heading" className="quitform__headline">
            <span className="quitform__headline-em">잠깐!</span>
            <br />
            정말 탈퇴하시겠어요?
          </h2>

          <p id="quitform-desc" className="quitform__sub">
            탈퇴 시, 재가입이 불가합니다.
          </p>

          <ul className="quitform__notes">
            <li>
              회원님의 프로필, 매칭 정보, 대화 내역 등 모든 활동 데이터가 영구
              삭제됩니다.
            </li>
          </ul>
        </div>

        <footer className="quitform__footer">
          <button
            type="button"
            className="quitform__btn quitform__btn--outline"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "처리 중…" : "확인"}
          </button>

          <button
            type="button"
            className="quitform__btn quitform__btn--danger"
            onClick={onCancel}
          >
            취소
          </button>
        </footer>
      </section>
    </div>
  );
}
