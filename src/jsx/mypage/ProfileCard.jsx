import "../../css/mypage/ProfileCard.css";

export default function ProfileCard({
  imageSrc, // 앞면 프로필 이미지 URL
  name = "홍길동", // 이름
  department = "학과", // 학과
  studentNo = "22", // 학번(두 자리 등)
  birthYear = "2003", // 출생년도
  gender = "MALE", // "MALE" | "FEMALE"
}) {
  return (
    <div className="profile-card-container">
      <div className="profile-card">
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
              >
                <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"></path>
                <path
                  fillRule="evenodd"
                  d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"
                ></path>
              </svg>
            )}
          </div>

          {/* 하단 흰 패널: 이름 표시 */}
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
                {gender === "MALE" ? "남자" : "여자"}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
