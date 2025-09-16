// src/api/chatStore.js
import { create } from "zustand";

const useChatStore = create((set) => ({
  rooms: [],
  setRooms: (rooms) => set({ rooms }),

  // ✅ 새 객체로 교체해서 리렌더링 보장
  updateRoomLastMessage: (roomId, lastMessage) =>
    set((state) => ({
      rooms: state.rooms.map((room) =>
        room.roomId === roomId
          ? { ...room, lastMessage: { ...lastMessage } }
          : room
      ),
    })),
}));

export default useChatStore;
