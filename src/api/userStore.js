import { create } from "zustand";
import { persist } from "zustand/middleware";

/* =========================================================
   zustand 기반 전역 사용자 상태 관리
   👉 로그인 정보(user), 초기화 여부(isInitialized) 같은 걸 저장
   👉 zustand/middleware 의 persist 덕분에 localStorage에도 저장됨
   👉 전역 어디서든 useUserStore() 불러서 접근 가능
========================================================= */

const useUserStore = create(
  persist(
    (set) => ({
      // 현재 로그인한 사용자 정보 (없으면 null)
      user: null,

      // 앱이 초기화 되었는지 여부 (자동 로그인 시도 등 체크용)
      isInitialized: false,

      // user 객체 저장
      setUser: (userInfo) => {
        console.log("🟢 [UserStore] setUser 호출:", userInfo);
        set({ user: userInfo });
      },

      // user 비우기
      clearUser: () => {
        console.log("🔴 [UserStore] clearUser 호출됨 (user = null)");
        set({ user: null });
      },

      // 로그아웃 처리 (스토어 + localStorage 정리)
      logout: () => {
        console.log("🔴 [UserStore] logout 호출됨 (user = null)");
        set({ user: null });
      },

      // 초기화 여부 세팅
      setInitialized: (value) => {
        console.log("⚙️ [UserStore] setInitialized:", value);
        set({ isInitialized: value });
      },
    }),
    {
      // localStorage 키 이름
      name: "user-storage",
    }
  )
);

export default useUserStore;
