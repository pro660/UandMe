// userStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

const useUserStore = create(
  persist(
    (set, get) => ({
      user: null,
      isInitialized: false,

      // ⬇️ 기존 의미 유지: 전체 교체(replace)
      setUser: (userInfo) => {
        console.log("🟢 [UserStore] setUser (replace):", userInfo);
        set({ user: userInfo });
      },

      // ⬇️ 신규: 부분 병합(update). 토큰/기타 필드 보존
      updateUser: (patch) => {
        const prev = get().user || {};
        const next = { ...prev, ...patch };
        console.log("🟢 [UserStore] updateUser (merge):", patch, "=>", next);
        set({ user: next });
      },

      clearUser: () => {
        console.log("🔴 [UserStore] clearUser");
        set({ user: null });
      },

      logout: () => {
        console.log("🔴 [UserStore] logout");
        set({ user: null });
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
