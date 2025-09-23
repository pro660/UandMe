import React from "react";
import { useNavigate } from "react-router-dom";   // ✅ 추가
import "../../css/tutorial/TutorHome.css";
import FlirtingTabs from "../home/FlirtingTabs";
import Logo from "../../image/loginPage/logo.svg";
import MatchingBanner from "../../image/home/match.svg";

function TutorHome() {
  const navigate = useNavigate();   // ✅ 훅 사용

  const handleNext = () => {
    navigate("/tutorial/matching");       // ✅ 원하는 튜토리얼 페이지 경로
  };

  return (
    <>
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-content">
          <p className="hero-subtitle">
            평범한 축제가 <span className="highlight">특별</span>해지는 순간! <br />
            당신의 옆자리를 채울 <span className="highlight">한 사람</span>을 찾아보세요.
          </p>
          <img src={Logo} alt="너랑 나랑 로고" className="hero-logo-img" />
        </div>
      </section>

      {/* 매칭 배너 섹션 */}
      <div className="home-matching-banner spotlight">
        <img
          src={MatchingBanner}
          alt="매칭 배너 이미지"
          className="matching-banner-img"
        />
        <div className="matching-banner-text">
          <h2>매칭하기</h2>
          <p>당신의 인연을 찾아보세요</p>
        </div>
      </div>

      {/* ✅ 튜토리얼 힌트 박스 (home- prefix) */}
      <div className="home-hint-wrap">
        <div className="home-hint" role="note" aria-live="polite">
          <span className="home-hint-caret" aria-hidden="true" />
          <p className="home-hint-text">
            <b>‘매칭하기’</b> 버튼을 선택하면, <span className="home-hint-em">매칭 상대</span>를 탐색할 수 있습니다.
          </p>
          <div className="home-hint-footer">
            <button type="button" className="home-hint-next" onClick={handleNext}>
              다음
            </button>
            <span className="home-hint-step">1/8</span>
          </div>
        </div>
      </div>

      <FlirtingTabs />

      {/* 화면 전체 딤 + 클릭 차단 (home- prefix) */}
      <div className="home-modal-dim" aria-hidden="true" />
      <div className="home-click-blocker" aria-hidden="true" />
    </>
  );
}

export default TutorHome;
