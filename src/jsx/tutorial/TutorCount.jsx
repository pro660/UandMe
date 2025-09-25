/* TutorCount.jsx */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/tutorial/TutorCount.css";
import Logo from "../../image/loginPage/logo.svg";
import TicketLogo from "../../image/home/ticket.svg";
import MatchingBanner from "../../image/home/match.svg";
import QandA from "../../image/home/q&a.svg";
import TutorfliImg from "../../image/tutorial/fli.svg";

function TutorCount() {
  const NEXT_ROUTE = "/tutorial/end";
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
    <>매칭 및 플러팅의 기회를 늘리고 싶다면, 축제날<br /><b>‘멋쟁이 사자처럼’</b>부스에서 쿠폰을 발급받으세요.</>,
  ];

  // 카드 내부 캐럿 위치
  const CARET_POS = [
    { top: -6, left: 260 },
    { top: 105, left: 40 },
  ];

  // ✅ 단계별 상단 위치와 가로 정렬만 지정 (좌/우 여백은 CSS에서 공통으로 관리)
  const TUTORIAL_PLACEMENTS = [
    { top: "10%", justify: "center" },   // step 1: 가운데
    { top: "20%", justify: "center" },   // step 2: 가운데
  ];

  const [stepIdx, setStepIdx] = useState(0);
  const isLast = stepIdx >= TUTORIAL_STEPS.length - 1;

  const handleNext = () => {
    if (!isLast) setStepIdx((p) => p + 1);
    else navigate(NEXT_ROUTE);
  };

  // 두 번째 단계부터 티켓 글로우
  const showGlow = stepIdx >= 1;

  // ✅ 바텀시트 표시 여부
  const showSheet = stepIdx === 1;

  const wrapStyle = {
    top: TUTORIAL_PLACEMENTS[stepIdx]?.top,
    justifyContent: TUTORIAL_PLACEMENTS[stepIdx]?.justify,
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

          {/* 티켓 아이콘: 글로우는 '다음' 누른 뒤(stepIdx>=1)부터 */}
          <img
            src={TicketLogo}
            alt="Ticket Icon"
            className={`tuhead-ticket-icon ${showGlow ? "tuhead-glow" : ""}`}
          />
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

      {/* ✅ 바텀시트: stepIdx === 1 일 때만 렌더 */}
      {showSheet && (
        <aside className="tucount-sheet" aria-label="쿠폰 등록 바텀시트">
          <div className="tucount-sheet-inner">
            <div className="tucount-sheet-handle" aria-hidden="true" />
            <h3 className="tucount-sheet-title">쿠폰 등록하기</h3>
            <div className="tucount-sheet-input">
              <span className="tucount-sheet-placeholder">인증번호 입력하기</span>
            </div>

            <ul className="tucount-sheet-bullets">
              <li>
                더 많은 만남을 원하신다면, 축제날 <b>‘멋쟁이 사자처럼’</b> 부스를
                방문해 음료와 함께 <b>특별한 쿠폰</b>을 받아보세요.
              </li>
              <li>매칭과 플러팅 기회를 더할 번쩍 더 드립니다.</li>
            </ul>
          </div>
        </aside>
      )}

      {/* ✅ 튜토리얼 모달 — 좌/우 공통 여백 유지 + 단계별 가로 정렬/높이 보존
          ⬇ stepIdx===1 때 전용 클래스 추가 (모바일에서 위치만 살짝 위로) */}
      <div
        className={`tucount-tutorial-wrap ${stepIdx === 1 ? "tucount-step-2" : ""}`}
        role="note"
        aria-live="polite"
        style={wrapStyle}
      >
        <div className="tucount-tutorial">
          <span
            className="tucount-tutorial-caret"
            aria-hidden="true"
            style={{ top: CARET_POS[stepIdx]?.top, left: CARET_POS[stepIdx]?.left }}
          />
          <p className="tucount-tutorial-text">{TUTORIAL_STEPS[stepIdx]}</p>

          <div className="tucount-tutorial-footer">
            <button type="button" className="tucount-tutorial-next" onClick={handleNext}>
              {isLast ? "다음" : "다음"}
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
