// src/pages/LoginOrGate.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../css/signup/loginPage.css";
import heartSvg from "../../image/loginPage/heart.svg";
import logoSvg from "../../image/loginPage/logo.svg";
import backgroundImage from "../../image/loginPage/background.png";
import api from "../../api/axios";
import useUserStore from "../../api/userStore";

/* 경로 상수(상대경로 유지) */
const KAKAO_LOGIN_PATH = "/auth/kakao/login";
const ME_PATH = "/users/me";

/* baseURL를 안전하게 절대 URL로 만드는 유틸 */
function toAbsoluteUrl(baseLike, path) {
  const p = (path || "").replace(/^\/+/, "");
  const b = (baseLike || "").trim();
  const hasProto = /^https?:\/\//i.test(b);

  if (hasProto) {
    return `${b.replace(/\/+$/, "")}/${p}`;
  }
  // baseLike가 '/api' 같이 상대경로면, 현재 origin과 합쳐서 절대화
  const origin = (typeof window !== "undefined" ? window.location.origin : "").replace(/\/+$/, "");
  const basePart = b ? `/${b.replace(/^\/+/, "").replace(/\/+$/, "")}` : "";
  return `${origin}${basePart}/${p}`;
}

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
        // 0) 로컬/URL 토큰 반영
        if (incomingAccessToken) {
          console.log("✅ URL에서 accessToken 확인:", incomingAccessToken);

          // store + localStorage
          const prev = useUserStore.getState().user || {};
          setUser({ ...prev, accessToken: incomingAccessToken });
          try {
            localStorage.setItem("accessToken", incomingAccessToken);
          } catch {}

          // axios 헤더도 즉시 반영
          try {
            api.defaults.headers.common.Authorization = `Bearer ${incomingAccessToken}`;
          } catch {}

          // URL 정리: 쿼리/해시 제거
          try {
            const qs = new URLSearchParams(location.search);
            qs.delete("accessToken");
            qs.delete("access");
            const cleanUrl = location.pathname + (qs.toString() ? `?${qs.toString()}` : "");
            window.history.replaceState({}, "", cleanUrl);
            console.log("🔄 URL에서 토큰 파라미터/해시 제거 완료");
          } catch {
            console.warn("⚠️ URL 정리 실패");
          }
        } else {
          // 저장된 토큰을 헤더에 반영(인스턴스 인터셉터가 없다면 대비)
          const tokenLS = (() => {
            try { return localStorage.getItem("accessToken"); } catch { return null; }
          })();
          if (tokenLS && !api.defaults.headers.common.Authorization) {
            api.defaults.headers.common.Authorization = `Bearer ${tokenLS}`;
          }
        }

        // 1) 내 정보 요청: 상대경로로 호출 (api 인스턴스 baseURL 사용)
        console.log("📡 GET", ME_PATH, "(baseURL:", api.defaults.baseURL, ")");
        const { data, status } = await api.get(ME_PATH, { validateStatus: () => true });
        console.log("📥 /users/me 응답:", status, data);

        // 401/419 → 인증 필요
        if (status === 401 || status === 419) {
          console.warn("⚠️ 토큰이 유효하지 않음 → 로그인 화면 유지");
          if (!mounted) return;
          setBusy(false);
          return;
        }

        // 200 OK → 사용자 정보 수신
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

        // 204 No Content → 프로필 없음(회원가입 필요)
        if (status === 204) {
          console.log("ℹ️ 프로필 없음(204) → 회원가입 페이지로 이동");
          if (!mounted) return;
          navigate("/infoform", { replace: true });
          return;
        }

        // 404는 보통 엔드포인트 미스/배포 설정 문제 → 가입 유무와 무관
        if (status === 404) {
          console.warn("⚠️ 404 Not Found: baseURL 또는 API 경로를 확인하세요.");
          // 여기서는 로그인 화면을 유지해서 사용자가 다시 시도할 수 있게 함
          if (!mounted) return;
          setBusy(false);
          return;
        }

        // 그 외 상태 → 에러로 처리하고 로그인 화면 유지
        console.error("❌ 예상치 못한 상태 코드:", status);
        if (!mounted) return;
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
      !!(() => { try { return localStorage.getItem("accessToken"); } catch { return null; } })();

    console.log("🔍 토큰 존재 여부 확인 →", hasToken ? "있음" : "없음");
    if (hasToken) gate();

    return () => {
      mounted = false;
    };
  }, [incomingAccessToken, location.pathname, location.hash, navigate, setUser, location.search]);

  // 3) 카카오 로그인: baseURL을 안전하게 절대 URL로 만든 뒤 next를 상대경로로 전달
  const handleKakao = () => {
    const configuredBase = api.defaults.baseURL || process.env.REACT_APP_API_URL || "";
    const baseAbs = toAbsoluteUrl(configuredBase, "/"); // 절대 base
    const nextRel = "/login"; // 콜백 후 다시 이 페이지로
    const loginAbs = toAbsoluteUrl(baseAbs, `${KAKAO_LOGIN_PATH}?next=${encodeURIComponent(nextRel)}`);
    console.log("➡️ 카카오 로그인 URL로 이동:", loginAbs);
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
