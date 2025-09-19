// src/jsx/mypage/YouProfile.jsx
import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import ProfileCard from "../mypage/ProfileCard.jsx";
import api from "../../api/axios.js";
import FlirtingPanel from "../matching/FlirtingPanel.jsx";
import "../../css/signup/ResultPage.css";

export default function YouProfile({ onClose }) {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const showFlirtingPanel = location.state?.showFlirtingPanel === true; // ✅ 조건부

  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      try {
        setLoading(true);
        const resp = await api.get(`/users/${userId}`);
        setUser(resp.data);
      } catch (err) {
        console.error("❌ 유저 정보 불러오기 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) {
    return (
      <div className="result-page">
        <div className="arch-box" aria-hidden="true" />
        <div style={{ marginTop: "5rem", textAlign: "center" }}>
          불러오는 중...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="result-page">
        <div className="arch-box" aria-hidden="true" />
        <div style={{ marginTop: "5rem", textAlign: "center" }}>
          상대방 정보를 불러올 수 없어요.
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
    introduce,
  } = user;

  return (
    <div className="result-page" style={{ position: "relative" }}>
      <div className="arch-box" aria-hidden="true" />

      {/* 닫기 버튼 */}
      {onClose && (
        <button
          className="close-btn"
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            fontSize: "1.5rem",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "black",
          }}
        >
          ✕
        </button>
      )}

      {/* 프로필 */}
      <div className="profile-with-insta">
        <ProfileCard
          imageSrc={typeImageUrl2}
          name={name}
          department={department}
          studentNo={studentNo}
          birthYear={birthYear}
          gender={gender}
          introduce={introduce}
          instagramUrl={instagramUrl}
          readOnly={true}
        />
      </div>

      {/* ✅ 매칭에서 넘어온 경우에만 플러팅 패널 */}
      {showFlirtingPanel && (
        <FlirtingPanel
          targetUserId={userId}
          onSent={() => alert(`${name} 님에게 플러팅을 보냈습니다!`)}
        />
      )}

      {/* 연애 유형 */}
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

      {introduce && (
        <div className="result-introduce">
          <h3>자기소개</h3>
          <p>{introduce}</p>
        </div>
      )}

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
