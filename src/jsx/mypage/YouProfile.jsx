// src/jsx/mypage/YouProfile.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProfileCard from "../mypage/ProfileCard.jsx";
import api from "../../api/axios.js";
import FlirtingPanel from "../matching/FlirtingPanel.jsx";
import "../../css/signup/ResultPage.css";

export default function YouProfile({
  userId: propUserId,
  onClose,
  fromMatching,
}) {
  const { userId: routeUserId } = useParams();
  // ✅ propUserId 최우선
  const userId = propUserId ?? routeUserId;

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

  if (loading) return <div className="result-page">불러오는 중...</div>;
  if (!user)
    return <div className="result-page">상대방 정보를 불러올 수 없어요.</div>;

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
    mbti,
    egenType,
  } = user;

  return (
    <div className="result-page" style={{ position: "relative" }}>
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
          mbti={mbti}
          egenType={egenType}
        />
      </div>

      {/* ✅ 매칭에서 열릴 때만 플러팅 버튼 */}
      {fromMatching && (
        <FlirtingPanel
          targetUserId={userId}
          onSent={() => alert(`${name} 님에게 플러팅을 보냈습니다!`)}
        />
      )}

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
