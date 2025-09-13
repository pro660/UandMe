// src/pages/LoginPage.jsx
import React from "react";
import "../css/LoginPage.css";
import heartSvg from "../image/loginPage/heart.svg";
import logoSvg from "../image/loginPage/logo.svg";
import backgroundImage from "../image/loginPage/background.png";

const RAW_BASE = (process.env.REACT_APP_API_URL || "").trim();
const IS_ABS = /^https?:\/\//i.test(RAW_BASE);
const API_BASE = (IS_ABS ? RAW_BASE : "http://1.201.17.231").replace(/\/+$/, "");
const KAKAO_LOGIN_PATH = "/auth/kakao/login";

export default function LoginPage() {
  // 로그인 성공 후 항상 이 경유 페이지에서 회원가입 여부를 판단
  const nextPath = "/post-login";

  const handleKakao = () => {
    const url = `${API_BASE}${KAKAO_LOGIN_PATH}?next=${encodeURIComponent(nextPath)}`;
    window.location.assign(url); // 백엔드로 이동(카카오 인증)
  };

  return (
    <main className="login-root" role="main" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <section className="arch-card" aria-label="너랑 나랑 소개 및 로그인">
        <div className="brand">
          <img src={heartSvg} alt="" className="heart-img" aria-hidden="true" />
          <img src={logoSvg} alt="너랑 나랑" className="logo-img" />
        </div>

        <div className="copy">
          <p className="headline">
            평범한 축제가 <span className="em">특별</span>해지는 순간!
          </p>
          <p className="sub">
            당신의 옆자리를 채울 <span className="em-strong">한 사람</span>을 찾아보세요.
          </p>
        </div>

        <div className="cta">
          <p className="hint">간편 로그인하고 바로 시작해보세요</p>
          <button type="button" className="kakao-btn" onClick={handleKakao}>
            <svg className="kakao-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3C6.48 3 2 6.5 2 10.82c0 2.7 1.78 5.05 4.46 6.39-.15.54-.55 1.95-.63 2.27-.1.4.15.4.31.29.12-.08 2-1.36 2.82-1.91 1 .14 2.03.21 3.04.21 5.52 0 10-3.5 10-7.85C22 6.5 17.52 3 12 3z" />
            </svg>
            카카오로 시작하기
          </button>
        </div>
      </section>
    </main>
  );
}
