import "../../css/home/Home.css";
import FlirtingTabs from "./FlirtingTabs";
import Logo from "../../image/loginPage/logo.svg";
import MatchingBanner from "../../image/home/match.svg";
import Map from "../../image/home/map.png";
import MapInfo from "../../image/home/mapinfo.png";
import QandA from "../../image/home/q&a.svg";

import DrinkMenu from "../home/DrinkMenu";
import PopUp from "./PopUp";
import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion"; // ✅ 추가
import Loader from "../common/Loader";                   // ✅ 추가

function Home() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // ✅ 로딩 상태 (예: 첫 렌더에서만 0.3초 로딩 흉내내기)
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300); // 실제 API 대기 대신
    return () => clearTimeout(timer);
  }, []);

  const fade = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.35 } },
    exit: { opacity: 0, transition: { duration: 0.35 } },
  };

  return (
    <>
      <AnimatePresence mode="sync">
        {!loading && (
          <motion.div key="home" {...fade}>
            <section className="hero">
              <div className="hero-bg"></div>
              <div className="hero-content">
                <p className="hero-subtitle">
                  평범한 축제가 <span className="highlight">특별</span>해지는 순간!{" "}
                  <br />
                  당신의 옆자리를 채울 <span className="highlight">한 사람</span>을
                  찾아보세요.
                </p>
                <img src={Logo} alt="너랑 나랑 로고" className="hero-logo-img" />
              </div>
            </section>

            {/* 매칭 배너 */}
            <Link to="/matching" className="home-matching-banner">
              <img
                src={MatchingBanner}
                alt="매칭 배너 이미지"
                className="matching-banner-img"
              />
              <div className="matching-banner-text">
                <h2>매칭하기</h2>
                <p>당신의 인연을 찾아보세요</p>
              </div>
            </Link>

            <FlirtingTabs />

            {/* 음료 메뉴 + 부스 위치 */}
            <section className="drink-and-map">
              <DrinkMenu />
              <div className="booth-location">
                <h3>
                  멋사부스는 <span className="highlight">이곳</span>에 있어요
                </h3>
                <div className="booth-map">
                  <img src={Map} alt="부스 위치 이미지" />
                </div>
                <div className="booth-map-info">
                  <img src={MapInfo} alt="부스 번호 이미지" />
                </div>
              </div>
            </section>

            {/* Q&A 버튼 */}
            <section className="QandA">
              <button
                className="QandA-btn"
                onClick={() => setIsPopupOpen(true)}
                type="button"
              >
                <div className="QandA-text">
                  <div className="Q-title" style={{ fontSize: "20px", fontWeight: "bold" }}>FAQ</div>
                  <div className="Q-subtitle" style={{ fontSize: "14px" }}>
                    자주 묻는 질문 및 개인정보 처리방침
                  </div>
                </div>
                <img src={QandA} alt="큐엔에이 이미지" />
              </button>
            </section>

            {/* 팝업 */}
            <PopUp open={isPopupOpen} onClose={() => setIsPopupOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ 로딩 오버레이 */}
      {loading && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 2000,
          }}
        >
          <Loader />
        </div>
      )}
    </>
  );
}

export default Home;
