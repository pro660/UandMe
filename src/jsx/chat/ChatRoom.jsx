// src/jsx/chat/ChatRoom.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "../../libs/firebase";
import useUserStore from "../../api/userStore";

export default function ChatRoom() {
  const { roomId } = useParams(); // 🔑 URL에서 roomId 읽기
  const user = useUserStore((s) => s.user); // 🔑 로그인 유저 정보
  const userId = user?.id;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // Firestore 메시지 구독
  useEffect(() => {
    if (!roomId) return;

    const q = query(
      collection(db, "chatRooms", roomId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsub();
  }, [roomId]);

  // 메시지 전송
  const sendMessage = async () => {
    if (!input.trim() || !userId) return;

    await addDoc(collection(db, "chatRooms", roomId, "messages"), {
      senderId: userId,
      text: input,
      createdAt: serverTimestamp(),
    });

    setInput("");
  };

  return (
    <div className="chat-room">
      <h2>채팅방: {roomId}</h2>

      <div
        className="chat-messages"
        style={{ height: "300px", overflowY: "auto", border: "1px solid #ddd", padding: "10px" }}
      >
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              textAlign: m.senderId === userId ? "right" : "left",
              margin: "5px 0",
            }}
          >
            <b>{m.senderId}</b>: {m.text}
          </div>
        ))}
      </div>

      <div className="chat-input" style={{ marginTop: "10px", display: "flex" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="메시지 입력"
          style={{ flex: 1 }}
        />
        <button onClick={sendMessage}>전송</button>
      </div>
    </div>
  );
}
