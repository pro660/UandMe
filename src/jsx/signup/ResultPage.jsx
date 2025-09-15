// src/jsx/question/ResultPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "../../api/userStore.js"; // zustand store
import ProfileCard from "../mypage/ProfileCard.jsx";

import instaIcon from "../../image/home/instagram.svg";

import "../../css/signup/ResultPage.css";

export default function ResultPage({ hideHomeButton = false }) {
  const navigate = useNavigate();
  const user = useUserStore((s) => s.user);

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
          사용자 정보를 불러올 수 없어요. 다시 로그인해 주세요.
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
  } = user;

  return (
    <div className="result-page">
      <div className="arch-box" aria-hidden="true" />

      {/* 홈 버튼 (조건부) */}
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
        />

        <a
          href="https://instagram.com/your_account"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src={instaIcon}
            alt="인스타그램"
            className="insta-icon"
          />
        </a>
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
