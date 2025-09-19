import { create } from "zustand";
import { persist } from "zustand/middleware";

const useMatchingStore = create(
  persist(
    (set) => ({
      peer: null,
      roomId: null,
      setMatch: ({ peer, roomId }) => set({ peer, roomId }), // 🔑 교체
      clearMatch: () => set({ peer: null, roomId: null }),

      // candidates 배열로 후보 정보 받기
      candidates: [],
      setCandidates: (list) => set({ candidates: Array.isArray(list) ? list : [] }),
    }),
    { name: "matching-storage" } // localStorage key
  )
);

export default useMatchingStore;
