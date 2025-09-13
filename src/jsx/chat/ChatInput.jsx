import React, { useState } from "react";
import { sendMessage } from "../services/chatActions";

export default function ChatInput({ roomId, myUid, otherUid }) {
  const [text, setText] = useState("");

  const onSend = async () => {
    try {
      await sendMessage({ roomId, text, myUid, otherUid });
      setText("");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="room-input">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="메시지를 입력하세요"
        onKeyDown={(e) => {
          if (e.key === "Enter") onSend();
        }}
      />
      <button onClick={onSend}>전송</button>
    </div>
  );
}
