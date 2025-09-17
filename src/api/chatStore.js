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
}));

export default useChatStore;
