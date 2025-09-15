// src/jsx/question/ResultPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "../../api/userStore.js"; // zustand store
import ProfileCard from "../mypage/ProfileCard.jsx";
import instaIcon from "../../image/home/instagram.svg";
import api from "../../api/axios.js"; // ✅ axios 인스턴스
import InstaAdd from "../mypage/InstaAdd.jsx"; // ✅ 방금 만든 모달 컴포넌트

import "../../css/signup/ResultPage.css";

export default function ResultPage({ hideHomeButton = false }) {
  const navigate = useNavigate();
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);

  const [showInstaModal, setShowInstaModal] = useState(false);

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

  // ✅ 인스타 저장 핸들러
  const handleSaveInstagram = async (instaId) => {
    try {
      // API 호출
      await api.put("/users/me/instagram", { instagram: instaId });

      // 최신 프로필 불러오기
      const resp = await api.get("/users/me/profile");
      const updatedProfile = resp.data;

      // zustand 상태 업데이트
      setUser(updatedProfile);

      // localStorage 업데이트
      localStorage.setItem("user", JSON.stringify(updatedProfile));

      alert("인스타그램이 저장되었습니다!");
    } catch (err) {
      console.error(err);
      alert("인스타그램 저장 중 오류가 발생했습니다.");
    }
  };

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

        <button
          type="button"
          className="insta-btn"
          onClick={() => setShowInstaModal(true)}
        >
          <img src={instaIcon} alt="인스타그램" className="insta-icon" />
        </button>
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

      {/* ✅ 인스타 추가 모달 */}
      {showInstaModal && (
        <InstaAdd
          defaultId={user.instagram} // 현재 저장된 아이디 내려주기
          onClose={() => setShowInstaModal(false)}
          onSave={handleSaveInstagram}
        />
      )}
    </div>
  );
}
