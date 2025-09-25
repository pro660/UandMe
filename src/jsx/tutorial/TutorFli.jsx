/* TutorFli.jsx */
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "../../css/tutorial/TutorFli.css";
import Logo from "../../image/loginPage/logo.svg";
import TutorMatchImg from "../../image/tutorial/tutormatch.svg";
import FliImg from "../../image/tutorial/fli.svg";

function TutorFli() {
  const navigate = useNavigate();

  // ✅ 이 페이지에서만 스크롤 방지
  useEffect(() => {
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, []);

  const handleNext = () => {
    navigate("/tutorial/6"); // 원하는 튜토리얼 페이지 경로
  };

  return (
    <>
      <section className="fli-hero">
        <div className="fli-hero-bg"></div>
        <div className="fli-hero-content">
          <p className="fli-hero-subtitle">
            평범한 축제가 <span className="fli-highlight">특별</span>해지는 순간! <br />
            당신의 옆자리를 채울 <span className="fli-highlight">한 사람</span>을 찾아보세요.
          </p>
          <img src={Logo} alt="너랑 나랑 로고" className="fli-hero-logo-img" />
        </div>
      </section>

      {/* 매칭 배너 섹션 */}
      <div className="fli-matching-banner">
        <img
          src={TutorMatchImg}
          alt="매칭 배너 이미지"
          className="fli-matching-banner-img"
        />
      </div>

      {/* ✅ 튜토리얼 힌트 박스: 이미지보다 위(앞)에 렌더링 */}
      <div className="fli-hint-wrap">
        <div className="fli-hint" role="note" aria-live="polite">
          <span className="fli-hint-caret" aria-hidden="true" />
          <p className="fli-hint-text">
            본인이 전송한 플러팅과 수신한 플러팅 내역은 <span className="fli-hint-em">'신호함'</span>에서 확인 가능합니다.
          </p>
          <div className="fli-hint-footer">
            <button type="button" className="fli-hint-next" onClick={handleNext}>
              다음
            </button>
            <span className="fli-hint-step">4/8</span>
          </div>
        </div>
      </div>

      {/* FlirtingTabs 대신 FliImg + spotlight 적용 */}
      <div className="spotlight fli-spotlight fli-hero-img-wrap">
        <img
          src={FliImg}
          alt="플러팅 이미지"
          className="fli-hero-img"
          draggable={false}
        />
      </div>

      {/* 화면 전체 딤 + 클릭 차단 */}
      <div className="fli-modal-dim" aria-hidden="true" />
      <div className="fli-click-blocker" aria-hidden="true" />
    </>
  );
}

export default TutorFli;
