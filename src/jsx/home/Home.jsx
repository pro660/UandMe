import "../../css/home/Home.css";
import FlirtingTabs from "./FlirtingTabs";
import Logo from "../../image/loginPage/logo.svg"; // 로고 import
import MatchingBanner from "../../image/home/match.svg";
import Map from "../../image/home/map.png";
import MapInfo from "../../image/home/mapinfo.png";
import QandA from "../../image/home/q&a.svg";

import DrinkMenu from "../home/DrinkMenu";
import PopUp from "./PopUp";
import { Link } from "react-router-dom"; // 추가
import React, { useState } from "react"; 

function Home() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  return (
    <>
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-content">
          <p className="hero-subtitle">
            평범한 축제가 <span className="highlight">특별</span>해지는 순간!{" "}
            <br />
            당신의 옆자리를 채울 <span className="highlight">한 사람</span>을
            찾아보세요.
          </p>

          {/* 로고 이미지 */}
          <img src={Logo} alt="너랑 나랑 로고" className="hero-logo-img" />
        </div>
      </section>

      {/* 매칭 배너 섹션 */}
      <Link to="/matching" className="home-matching-banner">
        <img
          src={MatchingBanner}
          alt="매칭 배너 이미지"
          className="matching-banner-img"
        />

        {/* 오버레이 텍스트 */}
        <div className="matching-banner-text">
          <h2>매칭하기</h2>
          <p>당신의 인연을 찾아보세요</p>
        </div>
      </Link>

      <FlirtingTabs />

      {/* 음료 메뉴 + 부스 위치 섹션 */}
      <section className="drink-and-map">
        <DrinkMenu />

        <div className="booth-location">
          <h3>
            멋사부스는 <span className="highlight">이곳</span>에 있어요
          </h3>
          <div className="booth-map">
            {/* 나중에 이미지 바꿔치기 가능 */}
            <img src={Map} alt="부스 위치 이미지" />
          </div>
          <div className="booth-map-info">
            <img src={MapInfo} alt="부스 번호 이미지" />
          </div>
        </div>
      </section>

      {/* Q&A 버튼 섹션 */}
      <section className="QandA">
        <button
          className="QandA-btn"
          onClick={() => setIsPopupOpen(true)}      // ✅ 팝업 열기
          type="button"
        >
          <div className="QandA-text">
            <div className="Q-title" style={{fontSize: "20px", fontWeight: "bold"}}>FAQ</div>
            <div className="Q-subtitle" style={{fontSize: "14px"}}>
              자주 묻는 질문 및 개인정보 처리방침
            </div>
          </div>
          <img src={QandA} alt="큐엔에이 이미지" />
        </button>
      </section>
      {/* 팝업 */}
      <PopUp open={isPopupOpen} onClose={() => setIsPopupOpen(false)} />
    </>
  );
}

export default Home;
