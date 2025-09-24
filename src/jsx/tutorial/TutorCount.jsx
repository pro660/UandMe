// src/components/tutorial/TutorCount.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/tutorial/TutorCount.css";
import Logo from "../../image/loginPage/logo.svg";
import TicketLogo from "../../image/home/ticket.svg";
import MatchingBanner from "../../image/home/match.svg";
import QandA from "../../image/home/q&a.svg";
import TutorfliImg from "../../image/tutorial/fli.svg";

function TutorCount() {
  const NEXT_ROUTE = "/tutorial/7";
  const navigate = useNavigate();

  // ✅ 이 페이지에서만 배경 스크롤 방지
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

  const TUTORIAL_STEPS = [
    <>매칭하기 및 플러팅 횟수는 이곳에서 확인 가능하며, 첫시작 혜택으로  <b>기본 3회</b>씩 제공됩니다.</>,
    <>‘거절’을 누르면 해당 상대의 프로필은 더 이상 표시되지 않습니다.<br /><b>신중하게 선택해 주세요.</b></>,
  ];

  // ✅ 캐럿 위치(카드 내부 기준)
  const CARET_POS = [
    { top: -6, left: 260 },
    { top: -6, left: 330 },
  ];

  // ✅ 모달(카드) 위치 — 단계별로 쉽게 수정 가능
  // top/left/transform/정렬(padding) 등을 단계별로 지정하세요.
  const TUTORIAL_PLACEMENTS = [
    // step 1: 화면 상단 중앙
    { top: "10%", left: "50%", transform: "translateX(-50%)", justify: "center" },
    // step 2: 헤더 높이 근처, 화면 오른쪽(티켓 아이콘 쪽)
    { top: "64px", left: "0", transform: "none", justify: "flex-end", pr: "16px" },
  ];

  const [stepIdx, setStepIdx] = useState(0);
  const isLast = stepIdx >= TUTORIAL_STEPS.length - 1;

  const handleNext = () => {
    if (!isLast) setStepIdx((p) => p + 1);
    else navigate(NEXT_ROUTE);
  };

  const wrapStyle = {
    top: TUTORIAL_PLACEMENTS[stepIdx]?.top,
    left: TUTORIAL_PLACEMENTS[stepIdx]?.left,
    transform: TUTORIAL_PLACEMENTS[stepIdx]?.transform,
    justifyContent: TUTORIAL_PLACEMENTS[stepIdx]?.justify,
    paddingRight: TUTORIAL_PLACEMENTS[stepIdx]?.pr || 0,
    paddingLeft: TUTORIAL_PLACEMENTS[stepIdx]?.pl || 0,
  };

  return (
    <>
      {/* 헤더 (헤더 전체는 딤 아래, 카운트 박스만 딤 위로 올림) */}
      <header className="tuhead-header">
        <div className="tuhead-header-logo">
          <img src={Logo} alt="U and Me Logo" />
        </div>

        <div className="tuhead-header-ticket-area">
          {/* ✅ 이 박스만 회색 딤 비적용(딤 위) */}
          <div className="tuhead-ticket-count-box">
            <p className="tuhead-ticket-label">남은 횟수</p>
            <p className="tuhead-ticket-values">
              매칭:<span className="tuhead-highlight">3회</span>
              <span style={{ marginRight: "0.1rem" }} />
              플러팅:<span className="tuhead-highlight">3회</span>
            </p>
          </div>

          {/* 티켓 아이콘: 은은한 핑크 글로우 애니메이션 */}
          <img src={TicketLogo} alt="Ticket Icon" className="tuhead-ticket-icon" />
        </div>
      </header>

      {/* 배경 콘텐츠 (시각만) */}
      <section className="tucount-hero">
        <div className="tucount-hero-bg"></div>
        <div className="tucount-hero-content">
          <p className="tucount-hero-subtitle">
            평범한 축제가 <span className="tucount-highlight">특별</span>해지는 순간! <br />
            당신의 옆자리를 채울 <span className="tucount-highlight">한 사람</span>을 찾아보세요.
          </p>
          <img src={Logo} alt="너랑 나랑 로고" className="tucount-hero-logo-img" />
        </div>
      </section>

      <div className="tucount-home-matching-banner">
        <img src={MatchingBanner} alt="매칭 배너 이미지" className="tucount-matching-banner-img" />
        <div className="tucount-matching-banner-text">
          <h2>매칭하기</h2>
          <p>당신의 인연을 찾아보세요</p>
        </div>
      </div>

      <img src={TutorfliImg} alt="" className="tucount-fli-img" />

      <section className="tucount-qanda">
        <div className="tucount-qanda-btn">
          <div className="tucount-q-text">
            <div className="tucount-q-title" style={{ fontSize: "20px", fontWeight: "bold" }}>
              FAQ
            </div>
            <div className="tucount-q-subtitle" style={{ fontSize: "14px" }}>
              자주 묻는 질문 및 개인정보 처리방침
            </div>
          </div>
          <img src={QandA} alt="큐엔에이 이미지" />
        </div>
      </section>

      {/* 회색 딤 (전체 덮음) */}
      <div className="tucount-modal-dim" aria-hidden="true" />

      {/* 튜토리얼 모달 — 단계별 위치 적용 */}
      <div className="tucount-tutorial-wrap" role="note" aria-live="polite" style={wrapStyle}>
        <div className="tucount-tutorial">
          <span
            className="tucount-tutorial-caret"
            aria-hidden="true"
            style={{ top: CARET_POS[stepIdx]?.top, left: CARET_POS[stepIdx]?.left }}
          />
          <p className="tucount-tutorial-text">{TUTORIAL_STEPS[stepIdx]}</p>

          <div className="tucount-tutorial-footer">
            <button type="button" className="tucount-tutorial-next" onClick={handleNext}>
              {isLast ? "완료" : "다음"}
            </button>
            <div className="tucount-tutorial-step">
              {stepIdx + 7}/{TUTORIAL_STEPS.length + 6}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default TutorCount;
