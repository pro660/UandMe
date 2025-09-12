// src/jsx/PostLoginGate.jsx
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios.js";

const RAW_BASE = (process.env.REACT_APP_API_URL || "").trim();
const IS_ABS = /^https?:\/\//i.test(RAW_BASE);
const API_BASE = (IS_ABS ? RAW_BASE : "http://1.201.17.231").replace(/\/+$/, "");
const PROFILE_URL = `${API_BASE}/users/me/profile`;

export default function PostLoginGate() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // 🔐 토큰은 axios 인스턴스(api) 인터셉터가 자동으로 붙여줌
        const { data } = await api.get(PROFILE_URL);

        // ✅ 백엔드가 주는 불리언 이름이 확실치 않음 → 가능한 후보를 순서대로 검사
        //    확정되면 하나만 남기세요.
        const backendFlag =
          data?.registered ??        // ← 후보 1 (확실치 않음)
          data?.isRegistered ??      // ← 후보 2 (확실치 않음)
          data?.profileCompleted;    // ← 후보 3 (확실치 않음)

        let isRegistered;
        if (typeof backendFlag === "boolean") {
          isRegistered = backendFlag;
        } else {
          // ⛑ 불리언이 없다면 필드 존재 여부로 추정 (조건은 백엔드와 협의 후 조정)
          const hasBasic =
            !!data?.name &&
            !!data?.birthYear &&
            !!data?.gender &&
            !!data?.department &&
            !!data?.studentNo;
          isRegistered = hasBasic;
        }

        if (!mounted) return;

        if (isRegistered) {
          navigate("/home", { replace: true }); // 가입 완료 → 메인 페이지로 경로 추후 설정
        } else {
          navigate("/infoform", { replace: true, state: { from: location } });
        }
      } catch (e) {
        // 토큰 문제나 서버 오류 시 → 로그인 페이지로 복귀
        navigate("/login", { replace: true, state: { from: location } });
      }
    })();
    return () => { mounted = false; };
  }, [navigate, location]);

  return <div style={{ padding: 24 }}>로그인 처리 중...</div>;
}
