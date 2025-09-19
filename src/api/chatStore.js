// src/api/chatStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

const useChatStore = create(
  persist(
    (set) => ({
      rooms: [],

      setRooms: (rooms) => set({ rooms }),

      updateRoomLastMessage: (roomId, lastMessage) =>
        set((state) => ({
          rooms: state.rooms.map((room) =>
            room.roomId === roomId ? { ...room, lastMessage } : room
          ),
        })),

      clearRooms: () => set({ rooms: [] }),

      // ✅ 삭제된 방 관리
      deletedRoomIds: [],
      addDeletedRoom: (roomId) =>
        set((state) => ({
          deletedRoomIds: [...new Set([...state.deletedRoomIds, roomId])],
        })),
      clearDeletedRoom: (roomId) =>
        set((state) => ({
          deletedRoomIds: state.deletedRoomIds.filter((id) => id !== roomId),
        })),
      resetChatStore: () => set({ rooms: [], deletedRoomIds: [] }),
    }),
    {
      name: "chat-storage", // ✅ localStorage key
      partialize: (state) => ({
        rooms: state.rooms,
        deletedRoomIds: state.deletedRoomIds,
      }),
    }
  )
);

export default useChatStore;
