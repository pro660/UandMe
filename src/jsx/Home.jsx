import "../css/Home.css";
import Logo from "../image/loginPage/logo.svg"; // 로고 import

function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-content">
          <p className="hero-subtitle">
            평범한 축제가 <span className="highlight">특별</span>해지는 순간! <br />
            당신의 옆자리를 채울 <span className="highlight">한 사람</span>을 찾아보세요.
          </p>

          {/* 로고 이미지 */}
          <img src={Logo} alt="너랑 나랑 로고" className="hero-logo-img" />
        </div>
      </section>
    </>
  );
}

export default Home;
