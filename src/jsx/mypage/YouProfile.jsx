// src/jsx/mypage/YouProfile.jsx
import React, { useEffect, useState } from "react";
import ProfileCard from "../mypage/ProfileCard.jsx";
import instaIcon from "../../image/home/instagram.svg";
import api from "../../api/axios.js"; // ✅ axios 인스턴스
import "../../css/signup/ResultPage.css"; // 기존 스타일 재활용

export default function YouProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
        <div style={{ marginTop: "5rem", textAlign: "center" }}>불러오는 중...</div>
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
    <div className="result-page">
      <div className="arch-box" aria-hidden="true" />

      <div className="profile-with-insta">
        <ProfileCard
          imageSrc={typeImageUrl2}
          name={name}
          department={department}
          studentNo={studentNo}
          birthYear={birthYear}
          gender={gender}
          readOnly={true}
          introduce={introduce}
          instagramUrl={instagramUrl}
        />

        {instagramUrl && (
          <a
            href={
              instagramUrl.startsWith("http")
                ? instagramUrl
                : `https://instagram.com/${instagramUrl}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="insta-btn"
          >
            <img src={instaIcon} alt="인스타그램" className="insta-icon" />
          </a>
        )}
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
