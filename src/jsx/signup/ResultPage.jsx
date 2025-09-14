// src/jsx/question/ResultPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "../../api/userStore.js"; // zustand store

import "../../css/signup/ResultPage.css";

export default function ResultPage() {
  const navigate = useNavigate();

  // zustand store에서 user 가져오기
  const user = useUserStore((s) => s.user);

  // 사용자가 없을 때 처리
  if (!user) {
    return (
      <div className="result-page">
        <div className="arch-box" aria-hidden="true" />
        <button className="home-btn" onClick={() => navigate("/")} type="button">
          홈화면 가기 ➔
        </button>
        <div style={{ marginTop: "5rem", textAlign: "center" }}>
          사용자 정보를 불러올 수 없어요. 다시 로그인해 주세요.
        </div>
      </div>
    );
  }

  // === 로컬스토리지 구조 기반 매핑 ===
  const {
    name,
    typeTitle,
    typeContent,
    typeImageUrl,
    styleSummary,
    recommendedPartner,
    tags,
  } = user;

  return (
    <div className="result-page">
      {/* 배경 아치 */}
      <div className="arch-box" aria-hidden="true" />

      {/* 홈 버튼 */}
      <button className="home-btn" onClick={() => navigate("/")} type="button">
        홈화면 가기 ➔
      </button>

      {/* 메인 이미지 */}
      <div className="result-image">
        <img src={typeImageUrl} alt={typeTitle} />
      </div>

      {/* 유형 제목/설명 */}
      <div className="result-info">
        <p className="result-subtitle">{name} 님의 연애 유형은...</p>
        <h2>{typeTitle}</h2>
        <p className="result-desc">{typeContent}</p>
      </div>

      {/* 특징 */}
      <div className="result-detail">
        <h3>특징</h3>
        <p>{styleSummary}</p>
      </div>

      {/* 추천 상대 */}
      <div className="result-partner">
        <h3>추천 상대</h3>
        <p>{recommendedPartner}</p>
      </div>

      {/* 해시태그 */}
      <div className="result-tags">
        {tags?.map((tag, idx) => (
          <span key={idx} className="tag">
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
}
