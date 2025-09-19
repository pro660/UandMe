// src/api/chatStore.js
import { create } from "zustand";

const useChatStore = create((set) => ({
  rooms: [],

  setRooms: (rooms) => set({ rooms }),

  updateRoomLastMessage: (roomId, lastMessage) =>
    set((state) => ({
      rooms: state.rooms.map((room) =>
        room.roomId === roomId
          ? { ...room, lastMessage }
          : room
      ),
    })),

  clearRooms: () => set({ rooms: [] }), // ✅ 추가
}));

export default useChatStore;
