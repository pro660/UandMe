import { create } from "zustand";

const useChatStore = create((set) => ({
  rooms: [],
  setRooms: (rooms) => set({ rooms }),
  addRoom: (room) => set((state) => ({ rooms: [...state.rooms, room] })),
}));

export default useChatStore;
