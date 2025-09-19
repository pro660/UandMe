// src/jsx/question/ResultPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "../../api/userStore.js"; // zustand store
import ProfileCard from "../mypage/ProfileCard.jsx";

import "../../css/signup/ResultPage.css";

export default function ResultPage({ hideHomeButton = false, user: propUser }) {
  const navigate = useNavigate();
  const storeUser = useUserStore((s) => s.user);
  const user = propUser || storeUser; // ✅ 더미 주입 시 propUser 우선

  if (!user) {
    return (
      <div className="result-page">
        <div className="arch-box" aria-hidden="true" />
        {!hideHomeButton && (
          <button
            className="home-btn"
            onClick={() => navigate("/")}
            type="button"
          >
            홈화면 가기 ➔
          </button>
        )}
        <div style={{ marginTop: "5rem", textAlign: "center" }}>
          사용자 정보를 불러올 수 없어요. <br />
          다시 로그인해 주세요.
        </div>
      </div>
    );
  }

  const {
    name,
    department,
    studentNo,
    birthYear,
    gender,
    typeTitle,
    typeContent,
    typeImageUrl2,
    styleSummary,
    recommendedPartner,
    tags,
    instagramUrl,
    mbti,
    egenType
  } = user;

  return (
    <div className="result-page">
      <div className="arch-box" aria-hidden="true" />

      {!hideHomeButton && (
        <button
          className="home-btn"
          onClick={() => navigate("/")}
          type="button"
        >
          홈화면 가기 ➔
        </button>
      )}

      <div className="profile-with-insta">
        <ProfileCard
          imageSrc={typeImageUrl2}
          name={name}
          department={department}
          studentNo={studentNo}
          birthYear={birthYear}
          gender={gender}
          instagramUrl={instagramUrl}
          mbti={mbti}
          egenType={egenType}
        />
      </div>

      <div className="result-info">
        <p className="result-subtitle">{name} 님의 연애 유형은...</p>
        <h2>{typeTitle}</h2>
        <p className="result-desc">{typeContent}</p>
      </div>

      <div className="result-detail">
        <h3>특징</h3>
        <p>{styleSummary}</p>
      </div>

      <div className="result-partner">
        <h3>추천 상대</h3>
        <p>{recommendedPartner}</p>
      </div>

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
