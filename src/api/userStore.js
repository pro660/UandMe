// src/api/userStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

const useUserStore = create(
  persist(
    (set, get) => ({
      user: null,                  // { accessToken, ... } 등 서버 유저 정보
      jwt: null,                   // (옵션) 서버 JWT 별도 보관 시
      firebaseCustomToken: null,   // (옵션) Firebase Custom Token
      isInitialized: false,

      // 전체 교체 (replace)
      setUser: (userInfo) => {
        console.log("🟢 [UserStore] setUser (replace):", userInfo);
        set({ user: userInfo });
      },

      // 부분 병합 (merge)
      updateUser: (patch) => {
        const prev = get().user || {};
        const next = { ...prev, ...patch };
        console.log("🟢 [UserStore] updateUser (merge):", patch, "=>", next);
        set({ user: next });
      },

      // ⬇️ accessToken만 안전하게 교체 (axios 리프레시에서 사용 권장)
      setAccessToken: (accessToken) => {
        const prev = get().user || {};
        const next = { ...prev, accessToken };
        console.log("🟢 [UserStore] setAccessToken:", accessToken ? "SET" : "EMPTY");
        set({ user: next });
      },

      // 크레딧 전용 업데이트
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

      // JWT 저장(선택)
      setJwt: (jwt) => {
        console.log("🟢 [UserStore] setJwt:", !!jwt);
        set({ jwt });
      },

      // Firebase Custom Token 저장(선택)
      setFirebaseCustomToken: (firebaseCustomToken) => {
        console.log("🟢 [UserStore] setFirebaseCustomToken:", !!firebaseCustomToken);
        set({ firebaseCustomToken });
      },

      // 로그아웃/초기화
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
      // 필요 시 persist 설정 확장 가능(예: version/migrate/partialize 등)
    }
  )
);

export default useUserStore;
