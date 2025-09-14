import { useState } from "react";
import useUserStore from "../../api/userStore";
import api from "../../api/axios";
import "../../css/mypage/ProfileCard.css";
import editIcon from "../../image/home/edit.svg"

import Animal from "../../image/home/animal.svg";

export default function ProfileCard({
  imageSrc,
  name = "홍길동",
  department = "학과",
  studentNo = "22",
  birthYear = "2003",
  gender,
}) {
  const [isFlipped, setIsFlipped] = useState(false);

  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);

  const [isEditing, setIsEditing] = useState(false);
  const [editingIntroduce, setEditingIntroduce] = useState(
    user?.introduce || ""
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await api.put("/users/me/introduce", {
        introduce: editingIntroduce,
      });
      if (res.status >= 200 && res.status < 300) {
        const updated = { ...user, introduce: editingIntroduce };
        setUser(updated);
        setIsEditing(false);
      }
    } catch (err) {
      console.error("❌ 소개 업데이트 실패:", err);
      alert("소개를 저장하지 못했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-card-wrapper">
      {/* === 말풍선 소개 영역 === */}
      <div className="introduce-bubble">
        {!isEditing ? (
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
                src= {editIcon}
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
              onClick={handleSave}
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
              {Animal ? (
                <img
                  src={Animal}
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
    </div>
  );
}
