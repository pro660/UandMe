import React, { useEffect, useRef } from "react";
import useRoomMessages from "../hooks/useRoomMessages";
import { markAsRead } from "../services/chatActions";

export default function ChatRoom({ roomId, myUid, onBack }) {
  const { messages, loading, loadMore } = useRoomMessages(roomId);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!roomId || !myUid) return;
    markAsRead({ roomId, myUid }).catch(console.error);
  }, [roomId, myUid]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!roomId) return null;

  return (
    <div className="room-wrap">
      <div className="room-header">
        <button onClick={onBack}>뒤로</button>
        <h3>채팅</h3>
      </div>

      <div
        className="room-history"
        onScroll={(e) => {
          if (e.currentTarget.scrollTop === 0) loadMore();
        }}
      >
        {loading && <div className="dim">로딩...</div>}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`msg ${m.senderId === myUid ? "mine" : "other"}`}
          >
            <div className="bubble">{m.text}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
