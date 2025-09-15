import React, { useEffect } from "react";
import AppRouter from "./Router";
import api, { willExpireSoon } from "./api/axios";
import useUserStore from "./api/userStore.js";

import { auth } from "./libs/firebase";
import { signOut } from "firebase/auth";
import { loginFirebaseWithCustomToken } from "./services/firebaseAuth";

function App() {
  const { isInitialized, setInitialized, clearUser } = useUserStore();

  const ensureFirebaseLogin = async (myUserId) => {
    if (auth.currentUser?.uid === myUserId) return;
    if (auth.currentUser && auth.currentUser.uid !== myUserId) {
      await signOut(auth).catch(() => {});
    }
    await loginFirebaseWithCustomToken(myUserId);
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const access = useUserStore.getState().user?.accessToken;

        if (access && willExpireSoon(access, 90)) {
          await api.post("/auth/refresh");
        }

        const myUserId =
          useUserStore.getState().user?.id ||
          useUserStore.getState().user?.userId;

        if (myUserId) {
          await ensureFirebaseLogin(myUserId);
        } else {
          if (auth.currentUser) await signOut(auth).catch(() => {});
        }
      } catch (e) {
        console.error("초기 부팅 중 오류:", e);
        clearUser();
        try {
          if (auth.currentUser) await signOut(auth);
        } catch {}
      } finally {
        setInitialized(true);
      }
    };

    bootstrap();
  }, []);

  useEffect(() => {
    const onWake = async () => {
      try {
        const access = useUserStore.getState().user?.accessToken;
        if (access && willExpireSoon(access, 90)) {
          await api.post("/auth/refresh");
        }

        const myUserId =
          useUserStore.getState().user?.id ||
          useUserStore.getState().user?.userId;

        if (myUserId) {
          await ensureFirebaseLogin(myUserId);
        } else if (auth.currentUser) {
          await signOut(auth).catch(() => {});
        }
      } catch {
        useUserStore.getState().clearUser();
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

  if (!isInitialized) return <div>Loading...</div>;

  return (
    <div className="App">
      <AppRouter />
    </div>
  );
}

export default App;
