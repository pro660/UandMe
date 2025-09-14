// src/pages/LoginOrGate.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../css/signup/loginPage.css";
import heartSvg from "../../image/loginPage/heart.svg";
import logoSvg from "../../image/loginPage/logo.svg";
import backgroundImage from "../../image/loginPage/background.png";
import api from "../../api/axios";
import useUserStore from "../../api/userStore";

/* 상대 경로 상수 */
const KAKAO_LOGIN_PATH = "/auth/kakao/login";
const ME_PATH = "/users/me";

/* 유틸: 절대 URL 만들기 */
function toAbsoluteUrl(baseLike, path) {
  const p = (path || "").replace(/^\/+/, "");
  const b = (baseLike || "").trim();
  const hasProto = /^https?:\/\//i.test(b);
  if (hasProto) return `${b.replace(/\/+$/, "")}/${p}`;
  const origin = (typeof window !== "undefined" ? window.location.origin : "").replace(/\/+$/, "");
  const basePart = b ? `/${b.replace(/^\/+/, "").replace(/\/+$/, "")}` : "";
  return `${origin}${basePart}/${p}`;
}

/* 유틸: baseURL 정규화/토글(/api 붙였다 뗐다) */
const trimSlash = (s) => (s || "").replace(/\/+$/, "");
function normalizeBase(base) {
  const b = (base || "").trim();
  if (!b) return "/api"; // 최소 기본치
  return b;
}
function toggleApiSuffix(base) {
  const b = trimSlash(base);
  if (b.match(/\/api$/i)) return b.replace(/\/api$/i, "");
  return `${b}/api`;
}

/* /users/me 스마트 호출: 404면 /api 붙여(또는 제거) 재시도 */
async function getMeSmart() {
  const primaryBase = normalizeBase(api.defaults.baseURL || process.env.REACT_APP_API_URL || "/api");

  // 1차 시도
  let res;
  try {
    res = await api.get(ME_PATH, { validateStatus: () => true, baseURL: primaryBase });
    if (res?.status !== 404) return { ...res, usedBase: primaryBase };
  } catch (e) {
    // 네트워크 에러는 바로 리턴(아래에서 busy 해제)
    return { error: e, usedBase: primaryBase };
  }

  // 404면 /api 붙이거나 제거해서 재시도
  const altBase = toggleApiSuffix(primaryBase);
  try {
    const res2 = await api.get(ME_PATH, { validateStatus: () => true, baseURL: altBase });
    return { ...res2, usedBase: altBase, altTried: true };
  } catch (e2) {
    return { error: e2, usedBase: altBase, altTried: true };
  }
}

export default function LoginOrGate() {
  const navigate = useNavigate();
  const location = useLocation();
  const setUser = useUserStore((s) => s.setUser);

  const [busy, setBusy] = useState(false);

  // 토큰 추출: ?accessToken | ?access | #accessToken | #access
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
        // 0) 토큰 주입/정리
        if (incomingAccessToken) {
          const prev = useUserStore.getState().user || {};
          setUser({ ...prev, accessToken: incomingAccessToken });
          try { localStorage.setItem("accessToken", incomingAccessToken); } catch {}
          try { api.defaults.headers.common.Authorization = `Bearer ${incomingAccessToken}`; } catch {}

          // URL에서 토큰 파라미터/해시 제거
          try {
            const qs = new URLSearchParams(location.search);
            qs.delete("accessToken"); qs.delete("access");
            const clean = location.pathname + (qs.toString() ? `?${qs}` : "");
            window.history.replaceState({}, "", clean);
          } catch {}
        } else {
          // 저장된 토큰을 헤더에 보강
          try {
            const ls = localStorage.getItem("accessToken");
            if (ls && !api.defaults.headers.common.Authorization) {
              api.defaults.headers.common.Authorization = `Bearer ${ls}`;
            }
          } catch {}
        }

        // 1) /users/me 스마트 호출
        const resp = await getMeSmart();
        const { data, status, usedBase, error } = resp || {};

        console.log("[/users/me] status:", status, "base:", usedBase, "data:", data);

        if (error) {
          console.error("💥 /users/me 네트워크 오류:", error);
          if (!mounted) return;
          setBusy(false);
          return;
        }

        // 401/419 → 인증 필요
        if (status === 401 || status === 419) {
          if (!mounted) return;
          setBusy(false);
          return;
        }

        // 2xx → 사용자 정보 OK
        if (status >= 200 && status < 300 && data) {
          const prev = useUserStore.getState().user || {};
          setUser({ ...prev, ...data });

          const flag = data?.isRegistered ?? data?.registered ?? data?.profileCompleted;
          const isRegistered =
            typeof flag === "boolean"
              ? flag
              : !!(data?.name && data?.studentNo && data?.gender && data?.department && (typeof data?.birthYear === "number" || data?.birthYear));

          if (!mounted) return;
          navigate(isRegistered ? "/" : "/infoform", { replace: true });
          return;
        }

        // 204 → 프로필 없음(회원가입)
        if (status === 204) {
          if (!mounted) return;
          navigate("/infoform", { replace: true });
          return;
        }

        // 404 → 경로 미스 가능성 높음. 여기선 로그인 화면 유지
        if (status === 404) {
          console.warn("⚠️ 404 Not Found - 백엔드의 /api 프록시/컨텍스트 경로를 확인하세요.");
          if (!mounted) return;
          setBusy(false);
          return;
        }

        // 기타 상태 → 로그인 화면 유지
        console.error("❌ 예외 상태 코드:", status, data);
        if (!mounted) return;
        setBusy(false);
      } catch (e) {
        console.error("💥 게이트 로직 오류:", e);
        if (!mounted) return;
        setBusy(false);
      }
    };

    const hasToken =
      !!incomingAccessToken ||
      !!useUserStore.getState().user?.accessToken ||
      (() => { try { return !!localStorage.getItem("accessToken"); } catch { return false; } })();

    if (hasToken) gate();
    return () => { mounted = false; };
  }, [incomingAccessToken, location.pathname, location.hash, navigate, setUser, location.search]);

  // 카카오 로그인: baseURL을 절대화해서 안전 리다이렉트
  const handleKakao = () => {
    const configuredBase = api.defaults.baseURL || process.env.REACT_APP_API_URL || "/api";
    const baseAbs = toAbsoluteUrl(configuredBase, "/");
    const nextRel = "/login";
    const loginAbs = toAbsoluteUrl(baseAbs, `${KAKAO_LOGIN_PATH}?next=${encodeURIComponent(nextRel)}`);
    window.location.assign(loginAbs);
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
