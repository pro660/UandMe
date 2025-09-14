import { useState } from "react";
import "../../css/mypage/ProfileCard.css";
import useUserStore from "../../api/userStore";
import api from "../../api/axios";

export default function ProfileCard({
  imageSrc,
  name = "홍길동",
  department = "학과",
  studentNo = "22",
  birthYear = "2003",
  gender,
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);

  const [editingIntroduce, setEditingIntroduce] = useState(
    user?.introduce || ""
  );

  // === API 호출 함수 ===
  const updateIntroduce = async (introduce) => {
    const res = await api.put("/users/me/introduce", { introduce });
    return res.data;
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await updateIntroduce(editingIntroduce);
      setUser({ ...user, introduce: updated.introduce });
      setIsEditing(false); // 저장 후 다시 보기 모드
    } catch (e) {
      console.error("한줄 소개 저장 실패:", e);
      alert("저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-card-wrapper">
      {/* 프로필 카드 */}
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
                <span className="value">
                  {gender}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* === 카드 바로 아래: 한줄 소개 === */}
      <div className="introduce-section">
        {!isEditing ? (
          <div className="introduce-view">
            <span className="introduce-text">
              {user?.introduce || "한줄 소개가 없습니다."}
            </span>
            <button
              type="button"
              className="introduce-edit-btn"
              onClick={() => setIsEditing(true)}
            >
              ✏️ 수정
            </button>
          </div>
        ) : (
          <div className="introduce-edit">
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
              {saving ? "저장중..." : "저장"}
            </button>
            <button
              type="button"
              className="introduce-cancel-btn"
              onClick={() => {
                setIsEditing(false);
                setEditingIntroduce(user?.introduce || "");
              }}
            >
              취소
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
