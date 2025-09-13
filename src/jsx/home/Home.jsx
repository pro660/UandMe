import "../../css/home/Home.css";
import Logo from "../../image/loginPage/logo.svg"; // 로고 import
import MatchingBanner from "../../image/home/match.svg";

import DrinkMenu from "../home/DrinkMenu";

function Home() {
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
      <div className="home-matching-banner">
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
      </div>

      {/* 음료 메뉴 + 부스 위치 섹션 */}
      <section className="drink-and-map">
        <DrinkMenu />

        <div className="booth-location">
          <h3>
            멋사부스는 <span className="highlight">이곳</span>에 있어요
          </h3>
          <div className="booth-map">
            {/* 나중에 이미지 바꿔치기 가능 */}
            <img src={Logo} alt="부스 위치 이미지" />
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;
