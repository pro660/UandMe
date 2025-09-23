import React from "react";
import { useNavigate } from "react-router-dom";   // ✅ 추가
import "../../css/tutorial/TutorHome.css";
import FlirtingTabs from "../home/FlirtingTabs";
import Logo from "../../image/loginPage/logo.svg";
// import MatchingBanner from "../../image/home/match.svg"; // ❌ 제거
import TutormatchImg from "../../image/tutorial/tutormatch.svg";

function TutorHome() {
  const navigate = useNavigate();   // ✅ 훅 사용

  const handleNext = () => {
    navigate("/tutorial/matching");       // ✅ 원하는 튜토리얼 페이지 경로
  };

  return (
    <>
      <section className="tur-hero">
        <div className="tur-hero-bg"></div>
        <div className="tur-hero-content">
          <p className="tur-hero-subtitle">
            평범한 축제가 <span className="tur-highlight">특별</span>해지는 순간! <br />
            당신의 옆자리를 채울 <span className="tur-highlight">한 사람</span>을 찾아보세요.
          </p>
          <img src={Logo} alt="너랑 나랑 로고" className="tur-hero-logo-img" />
        </div>
      </section>

      {/* ⬇️ 매칭 배너(텍스트 오버레이) 제거 → 이미지 + spotlight로 교체 */}
      <div className="spotlight tur-match-img-wrap">
        <img
          src={TutormatchImg}
          alt="매칭하기 튜토리얼 안내 이미지"
          className="tur-match-img"
          draggable={false}
        />
      </div>

      {/* ✅ 튜토리얼 힌트 박스 */}
      <div className="tur-home-hint-wrap">
        <div className="tur-home-hint" role="note" aria-live="polite">
          <span className="tur-home-hint-caret" aria-hidden="true" />
          <p className="tur-home-hint-text">
            <b>‘매칭하기’</b> 버튼을 선택하면, <span className="tur-home-hint-em">매칭 상대</span>를 탐색할 수 있습니다.
          </p>
          <div className="tur-home-hint-footer">
            <button type="button" className="tur-home-hint-next" onClick={handleNext}>
              다음
            </button>
            <span className="tur-home-hint-step">1/8</span>
          </div>
        </div>
      </div>

      <FlirtingTabs />

      {/* 화면 전체 딤 + 클릭 차단 */}
      <div className="tur-home-modal-dim" aria-hidden="true" />
      <div className="tur-home-click-blocker" aria-hidden="true" />
    </>
  );
}

export default TutorHome;
