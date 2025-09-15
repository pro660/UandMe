import { create } from "zustand";
import { persist } from "zustand/middleware";

/* =========================================================
   이거는 전역 사용자 상태 관리인데 요즘 트렌드에 맞는 사용자 정보 관리니까 공부해봐
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
      setUser: (userInfo) => set({ user: userInfo }),

      // user 비우기
      clearUser: () => set({ user: null }),

      // 로그아웃 처리 (스토어 + localStorage 정리)
      logout: () => {
        set({ user: null });
        localStorage.removeItem("user"); // persist가 저장한 데이터 중 user만 제거
      },

      // 초기화 여부 세팅
      setInitialized: (value) => set({ isInitialized: value }),
    }),
    {
      // localStorage 키 이름
      name: "user-storage",
    }
  )
);

export default useUserStore;

