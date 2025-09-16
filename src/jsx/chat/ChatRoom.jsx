// src/jsx/chat/ChatRoom.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import useUserStore from "../../store/userStore";
import api from "../../api/axios";

export default function ChatRoom() {
  const { roomId } = useParams();        // 🔑 URL에서 roomId
  const user = useUserStore((s) => s.user);
  const userId = user?.id;

  const [peer, setPeer] = useState(null);      // 상대방 정보
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // 1. 상대방(peer) 정보 가져오기 (백엔드)
  useEffect(() => {
    const fetchRoomInfo = async () => {
      try {
        const resp = await api.get(`/chat/rooms/${roomId}`);
        // API가 { peer, roomId, matchedAt } 구조로 응답한다고 가정
        setPeer(resp.data.peer);
      } catch (err) {
        console.error("❌ 방 정보 불러오기 실패", err);
      }
    };
    if (roomId) fetchRoomInfo();
  }, [roomId]);

  // 2. Firestore 메시지 구독
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

  // 3. 메시지 전송
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
      {/* 🔹 상대방 프로필 영역 */}
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
