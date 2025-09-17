// src/jsx/common/Modal.jsx
import React from "react";
import "../../css/common/Modal.css";

export default function Modal({ children, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()} // ✅ 내부 클릭은 닫히지 않음
      >
        <button className="modal-back-btn" onClick={onClose}>
          ← 뒤로가기
        </button>
        <div className="modal-content">{children}</div>
      </div>
    </div>
  );
}
