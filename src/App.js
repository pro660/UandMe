import React, { useEffect } from "react";
import AppRouter from "./Router";
import api, { willExpireSoon } from "./api/axios";
import useUserStore from "./api/userStore.js";

// 🔽 추가: Firebase 연동
import { auth } from "./libs/firebase"; // initializeApp/getAuth 해둔 곳
import { signOut } from "firebase/auth";
import { loginFirebaseWithCustomToken } from "./services/firebaseAuth"; // 앞서 만든 custom token 로그인 함수

function App() {
  const { isInitialized, setInitialized, clearUser } = useUserStore();

  // Firebase 쪽 로그인 동기화 보조함수
  const ensureFirebaseLogin = async (myUserId) => {
    // 이미 같은 uid로 로그인되어 있으면 스킵
    if (auth.currentUser?.uid === myUserId) return;
    // 다른 계정으로 로그인돼 있으면 정리
    if (auth.currentUser && auth.currentUser.uid !== myUserId) {
      await signOut(auth).catch(() => {});
    }
    // 백엔드에서 커스텀 토큰 받아서 Firebase 로그인
    await loginFirebaseWithCustomToken(myUserId);
  };

  //   앱 처음 켤 때 1회 점검
  // - localStorage/zustand에 accessToken 있으면 '곧' 만료인지 확인
  // - 90초 이내로 남았으면 조용히 /auth/refresh 한 번 치고 시작
  // - (NEW) 유저가 있으면 Firebase(Custom Token) 로그인 동기화
  useEffect(() => {
    const bootstrap = async () => {
      try {
        const raw = localStorage.getItem("user");
        const stored = raw ? JSON.parse(raw) : null;
        const access =
          useUserStore.getState().user?.accessToken || stored?.accessToken;

        // 백엔드 토큰 선제 갱신
        if (access && willExpireSoon(access, 90)) {
          await api.post("/auth/refresh");
        }

        // 🔽 Firebase 로그인 동기화
        const myUserId =
          useUserStore.getState().user?.id ||
          useUserStore.getState().user?.userId ||
          stored?.id ||
          stored?.userId;

        if (myUserId) {
          await ensureFirebaseLogin(myUserId);
        } else {
          // 앱에는 유저가 없는데 Firebase에 남아있다면 로그아웃
          if (auth.currentUser) {
            await signOut(auth).catch(() => {});
          }
        }
      } catch (e) {
        // refresh / firebase 로그인 에러면 세션 정리하고 깔끔하게 시작
        console.error("초기 부팅 중 오류:", e);
        clearUser();
        localStorage.removeItem("user");
        try {
          if (auth.currentUser) await signOut(auth);
        } catch {}
      } finally {
        // 라우터 렌더 시작 신호
        setInitialized(true);
      }
    };

    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //  탭에 다시 돌아왔을 때도 슬쩍 만료 임박 체크
  // - 포커스/가시성 변경 시 90초 이내면 refresh
  // - (NEW) 이 타이밍에도 Firebase 로그인 상태를 맞춰줌
  useEffect(() => {
    const onWake = async () => {
      try {
        const raw = localStorage.getItem("user");
        const stored = raw ? JSON.parse(raw) : null;
        const access =
          useUserStore.getState().user?.accessToken || stored?.accessToken;

        if (access && willExpireSoon(access, 90)) {
          await api.post("/auth/refresh");
        }

        // 🔽 Firebase 로그인 동기화
        const myUserId =
          useUserStore.getState().user?.id ||
          useUserStore.getState().user?.userId ||
          stored?.id ||
          stored?.userId;

        if (myUserId) {
          await ensureFirebaseLogin(myUserId);
        } else if (auth.currentUser) {
          await signOut(auth).catch(() => {});
        }
      } catch {
        // 여기서는 조용히 세션만 정리
        useUserStore.getState().clearUser();
        localStorage.removeItem("user");
        try {
          if (auth.currentUser) await signOut(auth);
        } catch {}
      }
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") onWake();
    };

    window.addEventListener("focus", onWake);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", onWake);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  // 초기화 끝나기 전엔 간단 로딩만 보여줘
  if (!isInitialized) return <div>Loading...</div>;

  // 실제 앱 라우팅 시작
  return (
    <div className="App">
      <AppRouter />
    </div>
  );
}

export default App;
