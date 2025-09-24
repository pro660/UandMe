import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ 추가
import "../../css/tutorial/TutorPopup.css";
import Logo from "../../image/loginPage/logo.svg";
import MatchingBanner from "../../image/home/match.svg";
import QandA from "../../image/home/q&a.svg";
import TutorfliImg from "../../image/tutorial/fli.svg";
import DogImg from "../../image/tutorial/dog.svg";

function TutorPopup() {
  // ✅ 이 컴포넌트가 떠 있는 동안만 배경 스크롤 잠금 (iOS 대응 포함)
  useEffect(() => {
    const body = document.body;
    const prev = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflow: body.style.overflow,
      overscrollBehavior: body.style.overscrollBehavior,
      touchAction: body.style.touchAction,
    };
    const scrollY = window.scrollY || document.documentElement.scrollTop || 0;

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";
    body.style.touchAction = "none";

    return () => {
      body.style.position = prev.position || "";
      body.style.top = prev.top || "";
      body.style.width = prev.width || "";
      body.style.overflow = prev.overflow || "";
      body.style.overscrollBehavior = prev.overscrollBehavior || "";
      body.style.touchAction = prev.touchAction || "";
      window.scrollTo(0, scrollY);
    };
  }, []);

  // ✅ 이동할 경로(원하는 경로로 바꿔 쓰세요)
  const NEXT_ROUTE = "/tutorial/7";

  const navigate = useNavigate();

  // ✅ 튜토리얼 문구들
  const TUTORIAL_STEPS = [
    <>플러팅 '수락' 시 <b>매칭이 성사</b>되며, 상대방과의 채팅방이 활성화되어 대화를 시작할 수 있습니다.</>,
    <>‘거절’을 누르면 해당 상대의 프로필은 더 이상 표시되지 않습니다.<br /><b>신중하게 선택해 주세요.</b></>,
  ];

  // ✅ 캐럿 위치(단계별)
  const CARET_POS = [
    { top: -6, left: 260 }, // step 1
    { top: -6, left: 90 },  // step 2
  ];

  const [stepIdx, setStepIdx] = useState(0);
  const isLast = stepIdx >= TUTORIAL_STEPS.length - 1;

  const handleNext = () => {
    if (!isLast) {
      setStepIdx((prev) => prev + 1);
    } else {
      navigate(NEXT_ROUTE); // ✅ 마지막 단계에서 이동
    }
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
          {/* 캐럿: 단계별 위치 적용 */}
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
            >
              {isLast ? "다음" : "다음"}
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
