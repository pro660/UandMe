// src/api/chatStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

const useChatStore = create(
  persist(
    (set) => ({
      rooms: [],

      // ✅ 전체 채팅방 목록 세팅
      setRooms: (rooms) => {
        console.log("🟢 [ChatStore] setRooms:", rooms);
        set({ rooms });
      },

      // ✅ 특정 채팅방 마지막 메시지 업데이트
      updateRoomLastMessage: (roomId, lastMessage) => {
        console.log("🟢 [ChatStore] updateRoomLastMessage:", roomId, lastMessage);
        set((state) => {
          const updated = state.rooms.map((room) =>
            room.roomId === roomId
              ? { ...room, lastMessage: { ...lastMessage } }
              : room
          );
          return { rooms: [...updated] }; // ✅ 새로운 배열로 교체 → React rerender 강제
        });
      },

      // ✅ 모든 방 초기화
      clearRooms: () => {
        console.log("🔴 [ChatStore] clearRooms");
        set({ rooms: [] });
      },
    }),
    {
      name: "chat-storage", // localStorage key
    }
  )
);

export default useChatStore;
