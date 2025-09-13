// src/pages/LoginOrGate.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../css/loginPage.css";
import heartSvg from "../image/loginPage/heart.svg";
import logoSvg from "../image/loginPage/logo.svg";
import backgroundImage from "../image/loginPage/background.png";
import api from "../api/axios";
import useUserStore from "../api/userStore";

const RAW_BASE = (process.env.REACT_APP_API_URL || "").trim();
const IS_ABS = /^https?:\/\//i.test(RAW_BASE);
const API_BASE = (IS_ABS ? RAW_BASE : "http://1.201.17.231").replace(/\/+$/, "");

const KAKAO_LOGIN_PATH = "/auth/kakao/login";
const ME_URL = `${API_BASE}/users/me`;

export default function LoginOrGate() {
  const navigate = useNavigate();
  const location = useLocation();
  const setUser = useUserStore((s) => s.setUser);

  const [busy, setBusy] = useState(false);
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const incomingAccessToken = params.get("accessToken");

  // 1) 카카오 콜백으로 돌아왔으면 게이트 로직 수행
  useEffect(() => {
    let mounted = true;

    const gate = async () => {
      setBusy(true);
      try {
        // URL 쿼리의 토큰을 스토어에 병합
        if (incomingAccessToken) {
          const prev = useUserStore.getState().user || {};
          setUser({ ...prev, accessToken: incomingAccessToken });

          // URL 정리
          try {
            const cleanUrl = location.pathname + (location.hash || "");
            window.history.replaceState({}, "", cleanUrl);
          } catch {}
        }

        // 내 정보 조회
        const { data, status } = await api.get(ME_URL, { validateStatus: () => true });

        if (status === 401 || status === 419) {
          if (!mounted) return;
          setBusy(false);
          // 토큰 문제 → 로그인 UI 유지
          return;
        }

        if (status >= 200 && status < 300 && data) {
          const prev = useUserStore.getState().user || {};
          setUser({ ...prev, ...data });

          // 등록 여부 판단(백엔드가 isRegistered 확정해주면 한 줄로 대체)
          const flag =
            data?.isRegistered ??
            data?.registered ??
            data?.profileCompleted;

          const isRegistered = (typeof flag === "boolean")
            ? flag
            : !!(data?.name && data?.studentNo && data?.gender && data?.department && (typeof data?.birthYear === "number" || data?.birthYear));

          if (!mounted) return;
          navigate(isRegistered ? "/" : "/infoform", { replace: true });
          return;
        }

        // 404/204 등 “프로필 없음” 신호 → 회원가입
        if (status === 404 || status === 204) {
          if (!mounted) return;
          navigate("/infoform", { replace: true });
          return;
        }

        // 예외 → 로그인 UI 유지
        setBusy(false);
      } catch (e) {
        console.error("LoginOrGate gate error:", e);
        if (!mounted) return;
        setBusy(false); // 로그인 UI로 남겨둠
      }
    };

    // 쿼리에 accessToken이 있거나, 이미 스토어에 토큰이 있으면 gate 시도
    const hasToken = !!incomingAccessToken || !!useUserStore.getState().user?.accessToken;
    if (hasToken) gate();

    return () => { mounted = false; };
  }, [incomingAccessToken, location.pathname, navigate, setUser, location.hash]);

  // 2) 카카오 로그인 버튼
  const handleKakao = () => {
    // next는 현재 페이지의 절대경로(/login)로: 콜백 후 다시 여기로 돌아와 gate 실행
    const nextAbs = `${window.location.origin}/login`;
    const url = `${API_BASE}${KAKAO_LOGIN_PATH}?next=${encodeURIComponent(nextAbs)}`;
    window.location.assign(url);
  };

  // 3) 게이트 동작 중일 땐 스피너/문구만
  if (busy) {
    return (
      <main className="login-root" role="main" style={{ padding: 24 }}>
        로그인 처리 중...
      </main>
    );
  }

  // 4) 평소엔 로그인 UI
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
