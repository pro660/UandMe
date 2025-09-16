import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "../../libs/firebase";
import useUserStore from "../../api/userStore";

export default function ChatRoom() {
  const { roomId } = useParams();
  const location = useLocation();
  const peer = location.state?.peer; // ✅ ChatList에서 넘어온 peer

  const user = useUserStore((s) => s.user);
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
      {/* 🔹 상대방 프로필 표시 */}
      {peer && (
        <div style={{ borderBottom: "1px solid #ddd", paddingBottom: "10px", marginBottom: "10px" }}>
          <h3>{peer.name} ({peer.department})</h3>
          {peer.introduce && <p>{peer.introduce}</p>}
          <div>
            <img src={peer.typeImageUrl} alt="type1" width={60} />
            <img src={peer.typeImageUrl2} alt="type2" width={60} />
          </div>
        </div>
      )}

      {/* 🔹 메시지 목록 */}
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

      {/* 🔹 입력창 */}
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
