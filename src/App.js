// src/App.jsx
import React, { useEffect, useState } from "react";
import AppRouter from "./Router";
import api, { willExpireSoon } from "./api/axios";
import useUserStore from "./api/userStore.js";

import { auth } from "./libs/firebase";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import Loader from "./jsx/common/Loader.jsx"; // ✅ 로더 임포트

export default function App() {
  const { isInitialized, setInitialized } = useUserStore();
  const [authReady, setAuthReady] = useState(false);

  // ✅ Firebase 익명 로그인 (앱 시작 시 1회)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      try {
        if (!fbUser) {
          await signInAnonymously(auth);
        }
      } catch (e) {
        console.error("[Auth] anonymous sign-in failed", e);
      } finally {
        setAuthReady(true);
      }
    });
    return unsub;
  }, []);

  // ✅ 기존 토큰 리프레시 부팅 로직 유지
  useEffect(() => {
    const bootstrap = async () => {
      try {
        const access = useUserStore.getState().user?.accessToken;
        if (access && willExpireSoon(access, 90)) {
          await api.post("/auth/refresh");
        }
      } catch (e) {
        console.error("초기 부팅 중 오류:", e);
      } finally {
        setInitialized(true);
      }
    };
    bootstrap();
  }, [setInitialized]);

  // 🔒 인증/부팅 둘 다 준비되면 렌더
  if (!isInitialized || !authReady) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <Loader />
      </div>
    );
  }

  return (
    <div className="App">
      <AppRouter />
    </div>
  );
}
