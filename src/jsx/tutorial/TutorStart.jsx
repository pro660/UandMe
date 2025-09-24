import React, { useEffect } from "react";
import "../../css/tutorial/TutorStart.css";
import Logo from "../../image/loginPage/logo.svg";
import TicketLogo from "../../image/home/ticket.svg";
import MatchingBanner from "../../image/home/match.svg";
import QandA from "../../image/home/q&a.svg";
import TutorfliImg from "../../image/tutorial/fli.svg";
import DogImg from "../../image/tutorial/dog.svg";
import { useNavigate } from "react-router-dom";

function TutorStart() {
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

  const navigate = useNavigate();

  const handleGoTu = () => {
    navigate("/tutorial/2");
  };

  return (
    <>
      {/* 헤더 (헤더 전체는 딤 아래, 카운트 박스만 딤 위로 올림) */}
      <header className="tustr-header">
        <div className="tustr-header-logo">
          <img src={Logo} alt="U and Me Logo" />
        </div>

        <div className="tustr-header-ticket-area">
          {/* ✅ 이 박스만 회색 딤 비적용(딤 위) */}
          <div className="tustr-ticket-count-box">
            <p className="tustr-ticket-label">남은 횟수</p>
            <p className="tustr-ticket-values">
              매칭:<span className="tustr-highlight">3회</span>
              <span style={{ marginRight: "0.1rem" }} />
              플러팅:<span className="tustr-highlight">3회</span>
            </p>
          </div>

          {/* 티켓 아이콘 (하이라이트 제거, 시각만) */}
          <img src={TicketLogo} alt="Ticket Icon" className="tustr-ticket-icon" />
        </div>
      </header>

      {/* 배경 콘텐츠 (시각만) */}
      <section className="tustr-hero">
        <div className="tustr-hero-bg"></div>
        <div className="tustr-hero-content">
          <p className="tustr-hero-subtitle">
            평범한 축제가 <span className="tustr-highlight">특별</span>해지는 순간! <br />
            당신의 옆자리를 채울 <span className="tustr-highlight">한 사람</span>을 찾아보세요.
          </p>
          <img src={Logo} alt="너랑 나랑 로고" className="tustr-hero-logo-img" />
        </div>
      </section>

      <div className="tustr-home-matching-banner">
        <img src={MatchingBanner} alt="매칭 배너 이미지" className="tustr-matching-banner-img" />
        <div className="tustr-matching-banner-text">
          <h2>매칭하기</h2>
          <p>당신의 인연을 찾아보세요</p>
        </div>
      </div>
      {/* ===== 항상 보이는 메인 팝업 ===== */}
            <div className="tustr-modal-dim" aria-hidden="true" />
      
            <div className="tustr-modal" role="dialog" aria-modal="true" aria-label="매칭성사 튜토리얼">
              <div className="tustr-modal-card">
                {/* 헤더 */}
                <div className="tustr-modal-header">
                  <div className="tustr-modal-title">튜토리얼</div>
                </div>
                {/* 본문 */}
                <div className="tustr-modal-body">
                  <div className="tustr-avatar">
                    <img src={DogImg} alt="프로필" />
                  </div>
                  <div className="tustr-profile-name">'너랑나랑' 앱을 이용해 주셔서 감사합니다.</div>
                  <p className="tustr-question">본 튜토리얼은 앱의 주요 기능을 효과적으로 활용하여 만족스러운 만남을 이룰 수 있도록 돕기 위해 마련되었습니다.<br/>
                  잠시 시간을 내어 앱 이용 방법을 확인하시고,<br/> <b className="hello">성공적인 경험</b>을 하시기를 바랍니다.</p>
                  <div className="tustr-actions">
                    <button className="tustr-btn tustr-btn-ghost" onClick={handleGoTu}>튜토리얼 시작하기</button>
                  </div>
                </div>
              </div>
            </div>

      <img src={TutorfliImg} alt="" className="tustr-fli-img" />

      <section className="tustr-qanda">
        <div className="tustr-qanda-btn">
          <div className="tustr-q-text">
            <div className="tustr-q-title" style={{ fontSize: "20px", fontWeight: "bold" }}>
              FAQ
            </div>
            <div className="tustr-q-subtitle" style={{ fontSize: "14px" }}>
              자주 묻는 질문 및 개인정보 처리방침
            </div>
          </div>
          <img src={QandA} alt="큐엔에이 이미지" />
        </div>
      </section>

      {/* 회색 딤 (전체 덮음) */}
      <div className="tustr-modal-dim" aria-hidden="true" />

    </>
  );
}

export default TutorStart;
