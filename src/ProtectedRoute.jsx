// src/App.jsx
import React, { useEffect } from "react";
import AppRouter from "./Router";
import api, { willExpireSoon } from "./api/axios";
import useUserStore from "./api/userStore.js";

function App() {
  const { isInitialized, setInitialized, clearUser } = useUserStore();

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const user = useUserStore.getState().user;
        const access = user?.accessToken;

        if (access && willExpireSoon(access, 90)) {
          await api.post("/auth/refresh");
        }
      } catch (e) {
        console.error("초기 부팅 오류:", e);
        clearUser();
      } finally {
        setInitialized(true);
      }
    };
    bootstrap();
  }, [clearUser, setInitialized]);

  if (!isInitialized) return <div>Loading...</div>;

  return (
    <div className="App">
      <AppRouter />
    </div>
  );
}

export default App;
