// src/jsx/mypage/ProfileCard.jsx
import { useState } from "react";
import useUserStore from "../../api/userStore";
import api from "../../api/axios";
import "../../css/mypage/ProfileCard.css";
import editIcon from "../../image/home/edit.svg";
import { ReactComponent as InstaIcon } from "../../image/home/instagram.svg";
import InstaAdd from "../mypage/InstaAdd.jsx"; // ✅ 인스타 모달 불러오기

export default function ProfileCard({
  imageSrc,
  name = "홍길동",
  department = "학과",
  studentNo = "22",
  birthYear = "2003",
  gender,
  readOnly = false,
  introduce,
  instagramUrl,
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const user = useUserStore((s) => s.user);

  const [isEditing, setIsEditing] = useState(false);
  const [editingIntroduce, setEditingIntroduce] = useState(
    user?.introduce || ""
  );
  const [saving, setSaving] = useState(false);

  // ✅ 인스타 수정 모달 상태
  const [showInstaModal, setShowInstaModal] = useState(false);

  const handleSaveIntroduce = async () => {
    try {
      setSaving(true);
      const res = await api.put("/users/me/introduce", {
        introduce: editingIntroduce,
      });
      if (res.status >= 200 && res.status < 300) {
        useUserStore.getState().updateUser({ introduce: editingIntroduce });
        setIsEditing(false);
      }
    } catch (err) {
      console.error("❌ 소개 업데이트 실패:", err);
      alert("소개를 저장하지 못했습니다.");
    } finally {
      setSaving(false);
    }
  };

  // ✅ 인스타 저장 핸들러
  const handleSaveInstagram = async (instaId) => {
    try {
      // 1) 서버에 저장
      await api.put("/users/me/instagram", { instagram: instaId });

      // 2) 최신 프로필 불러오기
      const resp = await api.get("/users/me/profile");
      const updatedProfile = resp.data;

      // 3) zustand 업데이트
      useUserStore.getState().updateUser(updatedProfile);

      alert("인스타그램이 저장되었습니다!");
    } catch (err) {
      console.error("❌ 인스타그램 저장 실패:", err);
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="profile-card-wrapper">
      {/* === 말풍선 소개 영역 === */}
      <div className="introduce-bubble">
        {readOnly ? (
          <span className="introduce-text">
            {introduce || "한줄 소개가 없습니다."}
          </span>
        ) : !isEditing ? (
          <>
            <span className="introduce-text">
              {user?.introduce || "한줄 소개가 없습니다."}
            </span>
            <button
              type="button"
              className="introduce-edit-icon"
              onClick={() => setIsEditing(true)}
            >
              <img
                src={editIcon}
                alt="수정하기"
                className="introduce-edit-img"
              />
            </button>
          </>
        ) : (
          <div className="introduce-edit-row">
            <input
              type="text"
              value={editingIntroduce}
              onChange={(e) => setEditingIntroduce(e.target.value)}
              className="introduce-input"
              maxLength={50}
              placeholder="안녕하세요, 영화 보는 걸 좋아해요."
            />
            <button
              type="button"
              className="introduce-save-btn"
              onClick={handleSaveIntroduce}
              disabled={saving}
            >
              {saving ? "..." : "✔"}
            </button>
            <button
              type="button"
              className="introduce-cancel-btn"
              onClick={() => {
                setIsEditing(false);
                setEditingIntroduce(user?.introduce || "");
              }}
            >
              ✖
            </button>
          </div>
        )}
      </div>

      {/* === 프로필 카드 === */}
      <div
        className="profile-card-container"
        onClick={() => setIsFlipped((v) => !v)}
        role="button"
        aria-label="프로필 카드 앞/뒤 전환"
      >
        <div className={`profile-card ${isFlipped ? "is-flipped" : ""}`}>
          {/* 앞면 */}
          <div className="profile-card-front">
            <div className="profile-card-image-wrap">
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt={`${name} 프로필`}
                  className="profile-card-image"
                />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="120"
                  height="120"
                  fill="currentColor"
                  className="profile-card-icon bi bi-person-circle"
                  viewBox="0 0 16 16"
                  aria-hidden
                >
                  <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"></path>
                  <path
                    fillRule="evenodd"
                    d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757-1.225 5.468-2.37A7 7 0 0 0 8 1z"
                  ></path>
                </svg>
              )}
            </div>

            <div className="profile-card-down">
              <p className="profile-card-name">{name}</p>
            </div>

            {/* ✅ 인스타 버튼 */}
            {readOnly ? (
              instagramUrl && (
                <a
                  href={
                    instagramUrl.startsWith("http")
                      ? instagramUrl
                      : `https://instagram.com/${instagramUrl}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="insta-btn-inside"
                  onClick={(e) => e.stopPropagation()}
                >
                  <InstaIcon style={{ width: "100%", height: "100%" }} />
                </a>
              )
            ) : (
              <button
                type="button"
                className="insta-btn-inside"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowInstaModal(true); // 모달 열기
                }}
              >
                <InstaIcon style={{ width: "100%", height: "100%" }} />
              </button>
            )}
          </div>

          {/* 뒷면 */}
          <div className="profile-card-back">
            <div className="profile-card-back-title">프로필 정보</div>
            <ul className="profile-card-back-list">
              <li>
                <span className="label">학과</span>
                <span className="value">{department}</span>
              </li>
              <li>
                <span className="label">학번</span>
                <span className="value">{studentNo}</span>
              </li>
              <li>
                <span className="label">출생년도</span>
                <span className="value">{birthYear}</span>
              </li>
              <li>
                <span className="label">성별</span>
                <span className="value">{gender}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ✅ 인스타 수정 모달 */}
      {showInstaModal && (
        <InstaAdd
          defaultId={instagramUrl}
          onClose={() => setShowInstaModal(false)}
          onSave={handleSaveInstagram} // 여기서 서버 저장 + zustand 업데이트
        />
      )}
    </div>
  );
}
