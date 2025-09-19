// src/jsx/mypage/ProfileCard.jsx
import { useEffect, useRef, useState } from "react";
import useUserStore from "../../api/userStore";
import api from "../../api/axios";
import "../../css/mypage/ProfileCard.css";
import editIcon from "../../image/home/edit.svg";
import { ReactComponent as InstaIcon } from "../../image/home/instagram.svg";
import InstaAdd from "../mypage/InstaAdd.jsx";

// 쿼리스트링(캐시버스터 등) 무시하고 경로만 비교해 루프 방지
function normalizeUrl(u) {
  if (!u) return "";
  try {
    const url = new URL(u, window.location.origin);
    return url.origin + url.pathname;
  } catch {
    // 상대경로, data:, blob: 등은 그대로 사용
    return u;
  }
}

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
  const user = useUserStore((s) => s.user);

  // 앞/뒤 뒤집기
  const [isFlipped, setIsFlipped] = useState(false);

  // 소개 수정
  const [isEditing, setIsEditing] = useState(false);
  const [editingIntroduce, setEditingIntroduce] = useState(user?.introduce || "");
  const [saving, setSaving] = useState(false);

  // 인스타 수정 모달
  const [showInstaModal, setShowInstaModal] = useState(false);

  // 프로필 이미지 로컬 미리보기 + 업로드 진행상태
  const [localImage, setLocalImage] = useState(imageSrc || "");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // 🔒 imageSrc → localImage 동기화 시 가드: 실제로 달라질 때만 set
  useEffect(() => {
    if (typeof imageSrc !== "string") {
      if (!imageSrc && localImage) setLocalImage("");
      return;
    }
    const nextN = normalizeUrl(imageSrc);
    const curN = normalizeUrl(localImage);
    if (nextN && nextN !== curN) {
      setLocalImage(imageSrc);
    }
    // localImage를 의존성에 넣으면 다시 루프가 생길 수 있어 의도적으로 제외
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageSrc]);

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

  // 인스타 저장
  const handleSaveInstagram = async (instaId) => {
    try {
      await api.put("/users/me/instagram", { instagram: instaId });
      const resp = await api.get("/users/me/profile");
      useUserStore.getState().updateUser(resp.data);
      alert("인스타그램이 저장되었습니다!");
    } catch (err) {
      console.error("❌ 인스타그램 저장 실패:", err);
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  // ✅ 프로필 이미지 업로드
  const openPicker = (e) => {
    e.stopPropagation(); // 카드 뒤집힘 방지
    fileInputRef.current?.click();
  };

  const handleSelectFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 간단 검증
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드할 수 있어요.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      alert("이미지 크기가 너무 커요. 8MB 이하로 올려주세요.");
      return;
    }

    // 즉시 미리보기
    const previewUrl = URL.createObjectURL(file);
    const prev = localImage;
    setLocalImage(previewUrl);
    setUploading(true);

    try {
      // 1) 파일 업로드
      const form = new FormData();
      form.append("file", file);

      const up = await api.post("/files/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const imageUrl =
        up?.data?.url ||
        up?.data?.imageUrl ||
        up?.data?.location ||
        up?.data?.data?.url;

      if (!imageUrl) throw new Error("업로드 응답에 URL이 없습니다.");

      // 2) 내 프로필 이미지로 반영
      await api.put("/users/me/profile-image", { imageUrl });

      // 3) 서버 URL로 즉시 교체(값이 바뀐 경우에만)
      const nextN = normalizeUrl(imageUrl);
      const curN = normalizeUrl(localImage);
      if (nextN !== curN) setLocalImage(imageUrl);

      // 4) 최신 프로필 재조회 후 store 업데이트
      const refreshed = await api.get("/users/me/profile");
      useUserStore.getState().updateUser(refreshed.data);
    } catch (err) {
      console.error("❌ 이미지 업로드 실패:", err);
      alert("이미지를 업로드하지 못했습니다.");
      // 실패 시 이전 이미지 복구
      setLocalImage(prev);
    } finally {
      setUploading(false);
      URL.revokeObjectURL(previewUrl); // 이제 <img>는 서버 URL을 보니 안전
      if (fileInputRef.current) fileInputRef.current.value = ""; // 같은 파일 재선택 가능
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
        aria-busy={uploading}
      >
        <div className={`profile-card ${isFlipped ? "is-flipped" : ""}`}>
          {/* 앞면 */}
          <div className="profile-card-front">
            <div className="profile-card-image-wrap">
              {localImage ? (
                <img
                  src={localImage}
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

              {/* ✅ 중앙 ‘사진 첨부’ 버튼 (읽기 전용 아닐 때만) */}
              {!readOnly && (
                <div className="avatar-upload-btn" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    className="avatar-upload-circle"
                    onClick={openPicker}
                    aria-label="프로필 사진 업로드"
                  >
                    {/* 카메라 아이콘 (inline SVG) */}
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M9.5 3h5l1.2 2H19a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h3.3L9.5 3zm2.5 14.5a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zm0-2a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z"/>
                    </svg>
                  </button>
                </div>
              )}

              {/* 숨겨진 파일 선택기 */}
              {!readOnly && (
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple={false}
                  onChange={handleSelectFile}
                  style={{ display: "none" }}
                />
              )}

              {/* 업로드 중 오버레이 */}
              {uploading && (
                <div className="avatar-uploading" onClick={(e) => e.stopPropagation()}>
                  <div className="avatar-spinner" />
                </div>
              )}
            </div>

            <div className="profile-card-down">
              <p className="profile-card-name">{name}</p>
            </div>

            {/* 인스타 버튼 */}
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
                  setShowInstaModal(true);
                }}
              >
                <InstaIcon style={{ width: "115%", height: "115%" }} />
              </button>
            )}
          </div>

          {/* 뒷면 */}
          <div className="profile-card-back">
            <div className="profile-card-back-title">프로필 정보</div>
            <ul className="profile-card-back-list">
              <li><span className="label">학과</span><span className="value">{department}</span></li>
              <li><span className="label">학번</span><span className="value">{studentNo}</span></li>
              <li><span className="label">출생년도</span><span className="value">{birthYear}</span></li>
              <li><span className="label">성별</span><span className="value">{gender}</span></li>
              <li><span className="label">MBTI</span><span className="value">{/* TODO: 실제 MBTI 필드로 교체 */}</span></li>
              <li><span className="label">성향</span><span className="value">{/* TODO: 실제 성향 필드로 교체 */}</span></li>
            </ul>
          </div>
        </div>
      </div>

      {/* 인스타 수정 모달 */}
      {showInstaModal && (
        <InstaAdd
          defaultId={instagramUrl}
          onClose={() => setShowInstaModal(false)}
          onSave={handleSaveInstagram}
        />
      )}
    </div>
  );
}
