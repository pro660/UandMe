import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../css/signup/loginPage.css";
import heartSvg from "../../image/loginPage/heart.svg";
import logoSvg from "../../image/loginPage/logo.svg";
import backgroundImage from "../../image/loginPage/background.png";
import api from "../../api/axios";
import useUserStore from "../../api/userStore";

// 🔑 Firebase Auth
import { signInWithCustomToken } from "firebase/auth";
import { auth } from "../../libs/firebase";

const RAW_BASE = (process.env.REACT_APP_API_URL || "").trim();
const IS_ABS = /^https?:\/\//i.test(RAW_BASE);
const API_BASE = (IS_ABS ? RAW_BASE : "http://1.201.17.231").replace(/\/+$/, "");

const KAKAO_LOGIN_PATH = "/auth/kakao/login";
const ME_URL = `${API_BASE}/auth/me`;

export default function LoginOrGate() {
  const navigate = useNavigate();
  const location = useLocation();
  const setUser = useUserStore((s) => s.setUser);

  const [busy, setBusy] = useState(false);

  const tokenFromQuery = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    return sp.get("accessToken") || sp.get("access");
  }, [location.search]);

  const tokenFromHash = useMemo(() => {
    const raw = (location.hash || "").replace(/^#/, "");
    if (!raw) return null;
    const sp = new URLSearchParams(raw);
    return sp.get("accessToken") || sp.get("access");
  }, [location.hash]);

  const incomingAccessToken = tokenFromQuery || tokenFromHash;

  useEffect(() => {
    let mounted = true;

    const gate = async () => {
      setBusy(true);
      try {
        if (incomingAccessToken) {
          const prev = useUserStore.getState().user || {};
          setUser({ ...prev, accessToken: incomingAccessToken });
          api.defaults.headers.common.Authorization = `Bearer ${incomingAccessToken}`;

          // URL 정리
          const qs = new URLSearchParams(location.search);
          qs.delete("accessToken");
          qs.delete("access");
          const cleanUrl =
            location.pathname + (qs.toString() ? `?${qs.toString()}` : "");
          window.history.replaceState({}, "", cleanUrl);
        }

        const { data, status } = await api.get(ME_URL, {
          validateStatus: () => true,
        });

        if (status === 401 || status === 419) {
          if (!mounted) return;
          setBusy(false);
          return;
        }

        if (status >= 200 && status < 300 && data) {
          const prev = useUserStore.getState().user || {};

          // 🔑 서버 응답에 jwt, firebaseToken, user 정보가 있다고 가정
          const { jwt, firebaseToken, user: userData } = data;

          // zustand 저장
          setUser({
            ...prev,
            ...userData,
            accessToken: jwt,
            firebaseToken,
          });

          // Firebase Auth 로그인 시도
          if (firebaseToken) {
            try {
              await signInWithCustomToken(auth, firebaseToken);
              console.log("✅ Firebase Auth 로그인 성공");
            } catch (err) {
              console.error("❌ Firebase 로그인 실패:", err);
            }
          }

          const flag =
            userData?.isRegistered ??
            userData?.registered ??
            userData?.profileCompleted;

          const isRegistered =
            typeof flag === "boolean"
              ? flag
              : !!(
                  userData?.name &&
                  userData?.studentNo &&
                  userData?.gender &&
                  userData?.department &&
                  (typeof userData?.birthYear === "number" ||
                    userData?.birthYear)
                );

          if (!mounted) return;
          navigate(isRegistered ? "/" : "/infoform", { replace: true });
          return;
        }

        if (status === 404 || status === 204) {
          if (!mounted) return;
          navigate("/infoform", { replace: true });
          return;
        }

        setBusy(false);
      } catch (e) {
        if (!mounted) return;
        setBusy(false);
      }
    };

    const hasToken =
      !!incomingAccessToken || !!useUserStore.getState().user?.accessToken;

    if (hasToken) gate();

    return () => {
      mounted = false;
    };
  }, [
    incomingAccessToken,
    location.pathname,
    location.hash,
    navigate,
    setUser,
    location.search,
  ]);

  const handleKakao = () => {
    const nextRel = "/login";
    const url = `${API_BASE}${KAKAO_LOGIN_PATH}?next=${encodeURIComponent(
      nextRel
    )}`;
    window.location.assign(url);
  };

  if (busy) {
    return (
      <main className="login-root" role="main" style={{ padding: 24 }}>
        로그인 처리 중...
      </main>
    );
  }

  return (
    <main
      className="login-root"
      role="main"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
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
            당신의 옆자리를 채울 <span className="em-strong">한 사람</span>을
            찾아보세요.
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
