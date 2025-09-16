// src/api/chatStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

const useChatStore = create(
  persist(
    (set) => ({
      rooms: [],

      // ✅ 방 목록 병합 (덮어쓰기 아님)
      mergeRooms: (newRooms) =>
        set((state) => {
          const merged = newRooms.map((newRoom) => {
            const existing = state.rooms.find((r) => r.roomId === newRoom.roomId);
            return existing
              ? {
                  ...newRoom,
                  lastMessage: existing.lastMessage, // 유지
                  unreadCount: existing.unreadCount ?? 0, // 유지
                }
              : { ...newRoom, lastMessage: null, unreadCount: 0 };
          });
          return { rooms: merged };
        }),

      // ✅ 마지막 메시지 업데이트
      updateRoomLastMessage: (roomId, lastMessage) =>
        set((state) => {
          const updated = state.rooms.map((room) =>
            room.roomId === roomId
              ? { ...room, lastMessage: { ...lastMessage } }
              : room
          );
          return { rooms: [...updated] };
        }),

      // ✅ 안읽은 메시지 카운트 세팅
      setUnreadCount: (roomId, count) =>
        set((state) => {
          const updated = state.rooms.map((room) =>
            room.roomId === roomId ? { ...room, unreadCount: count } : room
          );
          return { rooms: [...updated] };
        }),

      // ✅ 방 전체 초기화
      clearRooms: () => set({ rooms: [] }),
    }),
    {
      name: "chat-storage",
    }
  )
);

export default useChatStore;
