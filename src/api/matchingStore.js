import { create } from "zustand";
import { persist } from "zustand/middleware";

const useMatchingStore = create(
  persist(
    (set) => ({
      peer: null,
      roomId: null,
      setMatch: ({ peer, roomId }) => set({ peer, roomId }), // 🔑 교체
      clearMatch: () => set({ peer: null, roomId: null }),
    }),
    { name: "matching-storage" } // localStorage key
  )
);

export default useMatchingStore;
