import { create } from "zustand";
import { persist } from "zustand/middleware";

const useUserStore = create(
  persist(
    (set) => ({
      user: null,              // 현재 로그인한 사용자
      isInitialized: false,    // 앱 초기화 여부 (❌ 저장 안 함)

      setUser: (userInfo) => set({ user: userInfo }),
      clearUser: () => set({ user: null }),
      logout: () => set({ user: null }),
      setInitialized: (value) => set({ isInitialized: value }),
    }),
    {
      name: "user-storage",
      // ✅ localStorage에는 user만 저장
      partialize: (state) => ({ user: state.user }),
    }
  )
);

export default useUserStore;
