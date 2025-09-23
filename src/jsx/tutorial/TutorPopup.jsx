import React, { useState } from "react";
import "../../css/tutorial/TutorPopup.css";
import Logo from "../../image/loginPage/logo.svg";
import MatchingBanner from "../../image/home/match.svg";
import QandA from "../../image/home/q&a.svg";
import TutorfliImg from "../../image/tutorial/fli.svg";
import DogImg from "../../image/tutorial/dog.svg";

function TutorPopup() {
  // ✅ 튜토리얼 문구들 (원하시는 문구로 자유롭게 수정)
  const TUTORIAL_STEPS = [
    <>플러팅 '수락' 시 <b>매칭이 성사</b>되며, 상대방과의 채팅방이 활성화되어 대화를 시작할 수 있습니다.</>,
    <>‘거절’을 누르면 해당 상대의 프로필은 더 이상 표시되지 않습니다.<br /><b>신중하게 선택해 주세요.</b></>,
  ];

  // ✅ 캐럿 위치를 단계별로 제어 (left만 사용해 위치 변경)
  const CARET_POS = [
    { top: -6, left: 260 },  // step 5 (현재 시작점)
    { top: -6, left: 90 },   // step 6
  ];

  // ✅ 5번째 문구(인덱스 4)부터 시작
  const [stepIdx, setStepIdx] = useState(0);

  const handleNext = () => {
    setStepIdx((prev) =>
      prev < TUTORIAL_STEPS.length - 1 ? prev + 1 : prev
    );
  };

  return (
    <>
      {/* 배경 콘텐츠 (그냥 보여주기용) */}
      <section className="tupop-hero">
        <div className="tupop-hero-bg"></div>
        <div className="tupop-hero-content">
          <p className="tupop-hero-subtitle">
            평범한 축제가 <span className="tupop-highlight">특별</span>해지는 순간! <br />
            당신의 옆자리를 채울 <span className="tupop-highlight">한 사람</span>을 찾아보세요.
          </p>
          <img src={Logo} alt="너랑 나랑 로고" className="tupop-hero-logo-img" />
        </div>
      </section>

      <div className="tupop-home-matching-banner">
        <img
          src={MatchingBanner}
          alt="매칭 배너 이미지"
          className="tupop-matching-banner-img"
        />
        <div className="tupop-matching-banner-text">
          <h2>매칭하기</h2>
          <p>당신의 인연을 찾아보세요</p>
        </div>
      </div>

      <img src={TutorfliImg} alt="" className="tupop-fli-img" />

      <section className="tupop-qanda">
        <div className="tupop-qanda-btn">
          <div className="tupop-q-text">
            <div className="tupop-q-title" style={{ fontSize: "20px", fontWeight: "bold" }}>
              FAQ
            </div>
            <div className="tupop-q-subtitle" style={{ fontSize: "14px" }}>
              자주 묻는 질문 및 개인정보 처리방침
            </div>
          </div>
          <img src={QandA} alt="큐엔에이 이미지" />
        </div>
      </section>

      {/* ===== 항상 보이는 메인 팝업 ===== */}
      <div className="tupop-modal-dim" aria-hidden="true" />

      <div className="tupop-modal" role="dialog" aria-modal="true" aria-label="매칭성사 튜토리얼">
        <div className="tupop-modal-card">
          {/* 헤더 */}
          <div className="tupop-modal-header">
            <div className="tupop-modal-title">매칭성사</div>
            <div className="tupop-modal-close" aria-hidden="true">×</div>
          </div>

          {/* 본문 */}
          <div className="tupop-modal-body">
            <div className="tupop-avatar">
              <img src={DogImg} alt="프로필" />
            </div>
            <div className="tupop-profile-name">김멋사</div>
            <div className="tupop-profile-dept">항공소프트웨어공학과</div>

            <p className="tupop-question">플러팅을 수락하시겠습니까?</p>

            <div className="tupop-actions">
              <div className="tupop-btn tupop-btn-ghost">거절</div>
              <div className="tupop-btn tupop-btn-primary">수락</div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== 팝업 아래 튜토리얼 모달 ===== */}
      <div className="tupop-tutorial-wrap" role="note" aria-live="polite">
        <div className="tupop-tutorial">
          {/* 캐럿: 단계별 위치 적용 (inline style이 CSS보다 우선) */}
          <span
            className="tupop-tutorial-caret"
            aria-hidden="true"
            style={{
              top: CARET_POS[stepIdx]?.top,
              left: CARET_POS[stepIdx]?.left,
            }}
          />
          <p className="tupop-tutorial-text">
            {TUTORIAL_STEPS[stepIdx]}
          </p>

          <div className="tupop-tutorial-footer">
            <button
              type="button"
              className="tupop-tutorial-next"
              onClick={handleNext}
              disabled={stepIdx >= TUTORIAL_STEPS.length - 1}
            >
              다음
            </button>
            <div className="tupop-tutorial-step">
              {stepIdx + 5}/{TUTORIAL_STEPS.length + 6}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default TutorPopup;
