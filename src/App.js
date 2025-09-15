import React, { useEffect } from "react";
import AppRouter from "./Router";
import api, { willExpireSoon } from "./api/axios";
import useUserStore from "./api/userStore";

function App() {
  const { isInitialized, setInitialized, clearUser } = useUserStore();

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const raw = localStorage.getItem("user-storage");
        const stored = raw ? JSON.parse(raw).state?.user : null;
        const access =
          useUserStore.getState().user?.accessToken || stored?.accessToken;

        if (access && willExpireSoon(access, 90)) {
          await api.post("/auth/refresh");
        }
      } catch (e) {
        console.error("초기 부팅 오류:", e);
        clearUser();
        localStorage.removeItem("user-storage");
      } finally {
        setInitialized(true); // ✅ 반드시 초기화 완료
      }
    };

    bootstrap();
  }, [setInitialized, clearUser]);

  if (!isInitialized) return <div>Loading...</div>;

  return (
    <div className="App">
      <AppRouter />
    </div>
  );
}

export default App;
