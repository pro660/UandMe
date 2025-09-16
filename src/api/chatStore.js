import { create } from "zustand";

const useChatStore = create((set) => ({
  rooms: [],
  setRooms: (rooms) => set({ rooms }),
  updateRoomLastMessage: (roomId, lastMessage) =>
    set((state) => ({
      rooms: state.rooms.map((r) =>
        r.roomId === roomId ? { ...r, lastMessage } : r
      ),
    })),
}));

export default useChatStore;
