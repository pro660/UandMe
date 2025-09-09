import React, { useEffect } from "react";
import AppRouter from "./Router";
import api, { willExpireSoon } from "./api/axios";
import useUserStore from "./api/userStore.js";

function App() {
  const { isInitialized, setInitialized, clearUser } = useUserStore();

  //   앱 처음 켤 때 1회 점검
  // - localStorage/zustand에 accessToken 있으면 '곧' 만료인지 확인
  // - 90초 이내로 남았으면 조용히 /auth/refresh 한 번 치고 시작
  useEffect(() => {
    const bootstrap = async () => {
      try {
        const raw = localStorage.getItem("user");
        const access =
          useUserStore.getState().user?.accessToken ||
          (raw ? JSON.parse(raw).accessToken : null);

        if (access && willExpireSoon(access, 90)) {
          // 인터셉터가 알아서 처리하지만, 부팅 시엔 선제 갱신 한 번 해두면 깔끔함
          await api.post("/auth/refresh");
        }
      } catch (e) {
        // refresh가 에러면 세션 정리하고 깔끔하게 시작
        console.error("초기 refresh 실패:", e);
        clearUser();
        localStorage.removeItem("user");
      } finally {
        // 라우터 렌더 시작 신호
        setInitialized(true);
      }
    };

    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //  탭에 다시 돌아왔을 때도 슬쩍 만료 임박 체크(이거는 넣어도 되고 안넣어도 됨)
  // - 포커스/가시성 변경 시 90초 이내면 refresh
  // - 사용자 입장에선 튕김 없이 자연스러움 <- 이거 땜에 나는 쓰고 있어
  useEffect(() => {
    const onWake = async () => {
      try {
        const raw = localStorage.getItem("user");
        const access =
          useUserStore.getState().user?.accessToken ||
          (raw ? JSON.parse(raw).accessToken : null);

        if (access && willExpireSoon(access, 90)) {
          await api.post("/auth/refresh");
        }
      } catch {
        // 여기서는 조용히 세션만 정리
        useUserStore.getState().clearUser();
        localStorage.removeItem("user");
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
