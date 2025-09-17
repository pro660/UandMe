import { create } from "zustand";
import { persist } from "zustand/middleware";

const useUserStore = create(
  persist(
    (set, get) => ({
      user: null,
      jwt: null,            // ✅ 우리 서버 JWT
      firebaseToken: null,  // ✅ Firebase Custom Token
      isInitialized: false,

      // ⬇️ 전체 교체 (replace)
      setUser: (userInfo) => {
        console.log("🟢 [UserStore] setUser (replace):", userInfo);
        set({ user: userInfo });
      },

      // ⬇️ 부분 병합 (update)
      updateUser: (patch) => {
        const prev = get().user || {};
        const next = { ...prev, ...patch };
        console.log("🟢 [UserStore] updateUser (merge):", patch, "=>", next);
        set({ user: next });
      },

      // ⬇️ matchCredits / signalCredits 전용 업데이트
      updateCredits: ({ matchCredits, signalCredits }) => {
        const prev = get().user || {};
        const next = {
          ...prev,
          matchCredits:
            matchCredits !== undefined ? matchCredits : prev.matchCredits,
          signalCredits:
            signalCredits !== undefined ? signalCredits : prev.signalCredits,
        };
        console.log("🟢 [UserStore] updateCredits:", { matchCredits, signalCredits }, "=>", next);
        set({ user: next });
      },

      // JWT 저장
      setJwt: (jwt) => {
        console.log("🟢 [UserStore] setJwt:", jwt);
        set({ jwt });
      },

      // Firebase Token 저장
      setFirebaseToken: (firebaseToken) => {
        console.log("🟢 [UserStore] setFirebaseToken:", firebaseToken);
        set({ firebaseToken });
      },

      clearUser: () => {
        console.log("🔴 [UserStore] clearUser");
        set({ user: null, jwt: null, firebaseToken: null });
      },

      logout: () => {
        console.log("🔴 [UserStore] logout");
        set({ user: null, jwt: null, firebaseToken: null });
      },

      setInitialized: (value) => {
        console.log("⚙️ [UserStore] setInitialized:", value);
        set({ isInitialized: value });
      },
    }),
    { name: "user-storage" }
  )
);

export default useUserStore;
