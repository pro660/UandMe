import React from "react";

export default function ChatList({ rooms, onEnter }) {
  if (!rooms?.length)
    return <div className="chat-empty">채팅방이 없습니다.</div>;
  return (
    <ul className="chat-list">
      {rooms.map((r) => {
        const last = r.lastMessage?.text || "대화를 시작해보세요";
        const other = r.otherUserName || r.otherUserId || "상대"; // 방 생성 시 members 서브컬렉션에 덴орм 권장
        return (
          <li key={r.id} className="chat-item" onClick={() => onEnter(r)}>
            <div className="chat-title">{other}</div>
            <div className="chat-last">{last}</div>
          </li>
        );
      })}
    </ul>
  );
}
