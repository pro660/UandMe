import React, { useEffect } from "react";
import "../../css/tutorial/TutorEnd.css";
import Logo from "../../image/loginPage/logo.svg";
import TicketLogo from "../../image/home/ticket.svg";
import MatchingBanner from "../../image/home/match.svg";
import QandA from "../../image/home/q&a.svg";
import TutorfliImg from "../../image/tutorial/fli.svg";
import DogImg from "../../image/tutorial/dog.svg";
import { useNavigate } from "react-router-dom";

function TutorEnd() {
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

  const handleGoLogin = () => {
    navigate("/login");
  };

  return (
    <>
      {/* 헤더 (헤더 전체는 딤 아래, 카운트 박스만 딤 위로 올림) */}
      <header className="tuend-header">
        <div className="tuend-header-logo">
          <img src={Logo} alt="U and Me Logo" />
        </div>

        <div className="tuend-header-ticket-area">
          {/* ✅ 이 박스만 회색 딤 비적용(딤 위) */}
          <div className="tuend-ticket-count-box">
            <p className="tuend-ticket-label">남은 횟수</p>
            <p className="tuend-ticket-values">
              매칭:<span className="tuend-highlight">3회</span>
              <span style={{ marginRight: "0.1rem" }} />
              플러팅:<span className="tuend-highlight">3회</span>
            </p>
          </div>

          {/* 티켓 아이콘 (하이라이트 제거, 시각만) */}
          <img src={TicketLogo} alt="Ticket Icon" className="tuend-ticket-icon" />
        </div>
      </header>

      {/* 배경 콘텐츠 (시각만) */}
      <section className="tuend-hero">
        <div className="tuend-hero-bg"></div>
        <div className="tuend-hero-content">
          <p className="tuend-hero-subtitle">
            평범한 축제가 <span className="tuend-highlight">특별</span>해지는 순간! <br />
            당신의 옆자리를 채울 <span className="tuend-highlight">한 사람</span>을 찾아보세요.
          </p>
          <img src={Logo} alt="너랑 나랑 로고" className="tuend-hero-logo-img" />
        </div>
      </section>

      <div className="tuend-home-matching-banner">
        <img src={MatchingBanner} alt="매칭 배너 이미지" className="tuend-matching-banner-img" />
        <div className="tuend-matching-banner-text">
          <h2>매칭하기</h2>
          <p>당신의 인연을 찾아보세요</p>
        </div>
      </div>
      {/* ===== 항상 보이는 메인 팝업 ===== */}
            <div className="tuend-modal-dim" aria-hidden="true" />
      
            <div className="tuend-modal" role="dialog" aria-modal="true" aria-label="매칭성사 튜토리얼">
              <div className="tuend-modal-card">
                {/* 헤더 */}
                <div className="tuend-modal-header">
                  <div className="tuend-modal-title">튜토리얼</div>
                </div>
                {/* 본문 */}
                <div className="tuend-modal-body">
                  <div className="tuend-avatar">
                    <img src={DogImg} alt="프로필" />
                  </div>
                  <div className="tuend-profile-name">'너랑나랑' 앱 튜토리얼을 마치겠습니다.</div>
                  <p className="tuend-question">튜토리얼에서 안내해 드린 내용을 바탕으로,<br/> '너랑나랑'에서 새로운 인연을 탐색하고 성공적인 만남을 이루시기를 바랍니다.</p>
                  <div className="tuend-actions">
                    <button className="tuend-btn tuend-btn-ghost" onClick={handleGoLogin}>로그인 하러가기</button>
                  </div>
                </div>
              </div>
            </div>

      <img src={TutorfliImg} alt="" className="tuend-fli-img" />

      <section className="tuend-qanda">
        <div className="tuend-qanda-btn">
          <div className="tuend-q-text">
            <div className="tuend-q-title" style={{ fontSize: "20px", fontWeight: "bold" }}>
              FAQ
            </div>
            <div className="tuend-q-subtitle" style={{ fontSize: "14px" }}>
              자주 묻는 질문 및 개인정보 처리방침
            </div>
          </div>
          <img src={QandA} alt="큐엔에이 이미지" />
        </div>
      </section>

      {/* 회색 딤 (전체 덮음) */}
      <div className="tuend-modal-dim" aria-hidden="true" />

    </>
  );
}

export default TutorEnd;
