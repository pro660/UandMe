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
const ME_URL = `${API_BASE}/users/me`;

export default function LoginOrGate() {
  const navigate = useNavigate();
  const location = useLocation();
  const setUser = useUserStore((s) => s.setUser);

  const [busy, setBusy] = useState(false);

  // 1) 토큰 추출: 쿼리(?accessToken / ?access) + 해시(#accessToken / #access) 모두 허용
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
      console.log("🚀 게이트 로직 시작");
      setBusy(true);

      try {
        if (incomingAccessToken) {
          console.log("✅ URL에서 accessToken 확인:", incomingAccessToken);

          // store + localStorage에 저장 (axios가 localStorage를 참조하는 경우 대비)
          const prev = useUserStore.getState().user || {};
          setUser({ ...prev, accessToken: incomingAccessToken });
          try {
            localStorage.setItem("accessToken", incomingAccessToken);
          } catch {}

          // (선택) 현재 런타임의 axios 기본 헤더도 즉시 갱신
          try {
            api.defaults.headers.common.Authorization = `Bearer ${incomingAccessToken}`;
          } catch {}

          // URL 정리: 쿼리/해시 둘 다 제거
          try {
            const qs = new URLSearchParams(location.search);
            qs.delete("accessToken");
            qs.delete("access");
            const cleanUrl = location.pathname + (qs.toString() ? `?${qs.toString()}` : "");
            window.history.replaceState({}, "", cleanUrl); // 해시는 포함하지 않아 제거됨
            console.log("🔄 URL에서 토큰 파라미터/해시 제거 완료");
          } catch {
            console.warn("⚠️ URL 정리 실패");
          }
        }

        console.log("📡 /users/me 요청 보냄:", ME_URL);
        const { data, status } = await api.get(ME_URL, { validateStatus: () => true });
        console.log("📥 /users/me 응답:", status, data);

        if (status === 401 || status === 419) {
          console.warn("⚠️ 토큰이 유효하지 않음 → 로그인 화면 유지");
          if (!mounted) return;
          setBusy(false);
          return;
        }

        if (status >= 200 && status < 300 && data) {
          console.log("✅ 사용자 정보 조회 성공:", data);
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

          console.log("📝 회원가입 여부 판정:", isRegistered ? "가입 완료" : "미가입");

          if (!mounted) return;
          navigate(isRegistered ? "/" : "/infoform", { replace: true });
          return;
        }

        if (status === 404 || status === 204) {
          console.log("ℹ️ 프로필 없음 → 회원가입 페이지로 이동");
          if (!mounted) return;
          navigate("/infoform", { replace: true });
          return;
        }

        console.error("❌ 예상치 못한 상태 코드:", status);
        setBusy(false);
      } catch (e) {
        console.error("💥 게이트 로직 오류:", e);
        if (!mounted) return;
        setBusy(false);
      }
    };

    // 2) 토큰이 있거나(방금 받은/저장된) 이미 저장된 토큰이 있으면 게이트 시도
    const hasToken =
      !!incomingAccessToken ||
      !!useUserStore.getState().user?.accessToken ||
      !!localStorage.getItem("accessToken");

    console.log("🔍 토큰 존재 여부 확인 →", hasToken ? "있음" : "없음");
    if (hasToken) gate();

    return () => {
      mounted = false;
    };
  }, [incomingAccessToken, location.pathname, location.hash, navigate, setUser, location.search]);

  // 3) 카카오 로그인: next는 상대경로로 보내서 서버의 이중 도메인 버그를 회피
  const handleKakao = () => {
    const nextRel = "/login"; // 콜백 후 다시 이 페이지로 돌아오게
    const url = `${API_BASE}${KAKAO_LOGIN_PATH}?next=${encodeURIComponent(nextRel)}`;
    console.log("➡️ 카카오 로그인 URL로 이동:", url);
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
