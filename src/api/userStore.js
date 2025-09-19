// src/api/userStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

const useUserStore = create(
  persist(
    (set, get) => ({
      user: null, // { accessToken, ... } 포함
      jwt: null,
      firebaseCustomToken: null,
      isInitialized: false,

      // ✅ 객체 또는 함수(updater) 모두 허용
      setUser: (userOrUpdater) => {
        if (typeof userOrUpdater === "function") {
          set((state) => {
            const prev = state.user || {};
            const next = userOrUpdater(prev) || {};
            console.log("🟢 [UserStore] setUser (updater):", next);
            return { user: next };
          });
        } else {
          console.log("🟢 [UserStore] setUser (replace):", userOrUpdater);
          set({ user: userOrUpdater });
        }
      },

      // 부분 병합
      updateUser: (patch) => {
        const prev = get().user || {};
        const next = { ...prev, ...patch };
        console.log("🟢 [UserStore] updateUser (merge):", patch, "=>", next);
        set({ user: next });
      },

      // ✅ accessToken만 교체(리프레시에서 사용)
      setAccessToken: (accessToken) => {
        const prev = get().user || {};
        const next = { ...prev, accessToken };
        console.log("🟢 [UserStore] setAccessToken:", !!accessToken);
        set({ user: next });
      },

      // 크레딧 전용
      updateCredits: ({ matchCredits, signalCredits }) => {
        const prev = get().user || {};
        const next = {
          ...prev,
          matchCredits:
            matchCredits !== undefined ? matchCredits : prev.matchCredits,
          signalCredits:
            signalCredits !== undefined ? signalCredits : prev.signalCredits,
        };
        console.log(
          "🟢 [UserStore] updateCredits:",
          { matchCredits, signalCredits },
          "=>",
          next
        );
        set({ user: next });
      },

      setJwt: (jwt) => {
        console.log("🟢 [UserStore] setJwt:", !!jwt);
        set({ jwt });
      },
      setFirebaseCustomToken: (firebaseCustomToken) => {
        console.log(
          "🟢 [UserStore] setFirebaseCustomToken:",
          !!firebaseCustomToken
        );
        set({ firebaseCustomToken });
      },

      clearUser: () => {
        console.log("🔴 [UserStore] clearUser");
        set({ user: null, jwt: null, firebaseCustomToken: null });
      },
      logout: () => {
        console.log("🔴 [UserStore] logout");
        set({ user: null, jwt: null, firebaseCustomToken: null });
      },

      setInitialized: (value) => {
        console.log("⚙️ [UserStore] setInitialized:", value);
        set({ isInitialized: value });
      },
    }),
    {
      name: "user-storage",
    }
  )
);

export default useUserStore;
