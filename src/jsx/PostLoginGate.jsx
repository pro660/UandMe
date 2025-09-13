// src/jsx/PostLoginGate.jsx
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios.js";
import useUserStore from "../api/userStore.js";

const RAW_BASE = (process.env.REACT_APP_API_URL || "").trim();
const IS_ABS = /^https?:\/\//i.test(RAW_BASE);
const API_BASE = (IS_ABS ? RAW_BASE : "http://1.201.17.231").replace(/\/+$/, "");
const PROFILE_URL = `${API_BASE}/users/me/profile`;

export default function PostLoginGate() {
  const navigate = useNavigate();
  const location = useLocation();

  const setUser = useUserStore((s) => s.setUser);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        // 1) 카카오 콜백으로 전달된 accessToken 쿼리 파라미터 추출
        const params = new URLSearchParams(location.search);
        const accessToken = params.get("accessToken");

        if (accessToken) {
          // zustand에 저장 (기존 user 객체 보존)
          const prev = useUserStore.getState().user || {};
          setUser({ ...prev, accessToken });

          // URL에서 토큰 제거 – 현재 화면 그대로 유지
          try {
            const cleanUrl = location.pathname + (location.hash || "");
            window.history.replaceState({}, "", cleanUrl);
          } catch {
            /* noop */
          }
        }

        // 2) 내 프로필 조회 (axios 인스턴스가 Authorization/리프레시 자동 처리)
        const { data } = await api.get(PROFILE_URL);

        // 3) 사용자 정보도 store에 병합 저장
        {
          const prev = useUserStore.getState().user || {};
          // accessToken은 위 단계에서 이미 들어갔을 수도 있으니 보존
          setUser({ ...prev, ...data });
        }

        // 4) 회원가입 여부 판단
        // ⚠️ 백엔드 확정 필드명이 있으면 그 하나만 쓰세요 (예: data.isRegistered)
        const flag =
          data?.isRegistered ??      // 후보 1 (권장, 확정되면 이것만 사용)
          data?.registered ??        // 후보 2
          data?.profileCompleted;    // 후보 3
        let isRegistered;
        if (typeof flag === "boolean") {
          isRegistered = flag;
        } else {
          // 불리언이 없다면 필드 존재 여부로 추정 (백엔드와 협의 후 조정)
          isRegistered =
            !!data?.name &&
            !!data?.birthYear &&
            !!data?.gender &&
            !!data?.department &&
            !!data?.studentNo;
        }

        if (!mounted) return;

        // 5) 분기: 가입 완료 → 홈 / 미가입 → 회원가입 폼
        navigate(isRegistered ? "/" : "/infoform", { replace: true });
      } catch (err) {
        // (토큰 문제/서버 오류) → 로그인으로 복귀
        console.error("PostLoginGate error:", err);
        if (!mounted) return;
        navigate("/login", { replace: true, state: { from: location } });
      }
    })();

    return () => {
      mounted = false;
    };
  }, [location, navigate, setUser]);

  return <div style={{ padding: 24 }}>로그인 처리 중...</div>;
}
