// src/pages/LoginOrGate.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../css/signup/loginPage.css";
import heartSvg from "../../image/loginPage/heart.svg";
import logoSvg from "../../image/loginPage/logo.svg";
import backgroundImage from "../../image/loginPage/background.png";
import api from "../../api/axios";
import useUserStore from "../../api/userStore";

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

  // 쿼리 / 해시에서 토큰 추출
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
          // zustand user에만 저장
          const prev = useUserStore.getState().user || {};
          setUser({ ...prev, accessToken: incomingAccessToken });

          // axios 기본 헤더 갱신
          api.defaults.headers.common.Authorization = `Bearer ${incomingAccessToken}`;

          // URL에서 토큰 제거
          const qs = new URLSearchParams(location.search);
          qs.delete("accessToken");
          qs.delete("access");
          const cleanUrl =
            location.pathname +
            (qs.toString() ? `?${qs.toString()}` : "");
          window.history.replaceState({}, "", cleanUrl);
        }

        const { data, status } = await api.get(ME_URL, {
          validateStatus: () => true,
        });

        if (status === 401 || status === 419) {
          if (!mounted) return;
          setBusy(false);
          return; // 로그인 화면 유지
        }

        if (status >= 200 && status < 300 && data) {
          const prev = useUserStore.getState().user || {};
          setUser({ ...prev, ...data });

          const flag =
            data?.isRegistered ??
            data?.registered ??
            data?.profileCompleted;

          const isRegistered =
            typeof flag === "boolean"
              ? flag
              : !!(
                  data?.name &&
                  data?.studentNo &&
                  data?.gender &&
                  data?.department &&
                  (typeof data?.birthYear === "number" || data?.birthYear)
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
        console.error("💥 게이트 로직 오류:", e);
        if (!mounted) return;
        setBusy(false);
      }
    };

    // accessToken이 있으면만 gate 실행
    const hasToken =
      !!incomingAccessToken || !!useUserStore.getState().user?.accessToken;

    if (hasToken) gate();

    return () => {
      mounted = false;
    };
  }, [incomingAccessToken, location, navigate, setUser]);

  const handleKakao = () => {
    const nextRel = "/login"; // 로그인 완료 후 이 페이지로 돌아옴
    const url = `${API_BASE}${KAKAO_LOGIN_PATH}?next=${encodeURIComponent(nextRel)}`;
    window.location.assign(url);
  };

  if (busy) {
    return <main className="login-root" style={{ padding: 24 }}>로그인 처리 중...</main>;
  }

  return (
    <main
      className="login-root"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <section className="arch-card">
        <div className="brand">
          <img src={heartSvg} alt="" className="heart-img" />
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
            카카오로 시작하기
          </button>
        </div>
      </section>
    </main>
  );
}
