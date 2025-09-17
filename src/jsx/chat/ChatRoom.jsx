import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { db } from "../../libs/firebase";
import useUserStore from "../../api/userStore";

export default function ChatRoom() {
  const { roomId } = useParams();
  const { user } = useUserStore();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // ✅ 메시지 실시간 구독
  useEffect(() => {
    if (!roomId) return;

    const q = query(
      collection(db, "chatRooms", roomId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(newMessages);

      // 👉 새로운 메시지가 들어왔는데 내가 보낸 게 아니면 → 읽음 처리
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const msg = change.doc.data();
          if (msg.senderId !== String(user.userId)) {
            markAsRead(roomId, user.userId);
          }
        }
      });
    });

    return () => unsub();
  }, [roomId, user?.userId]);

  // ✅ 방에 입장할 때 내 unread 초기화
  useEffect(() => {
    if (roomId && user?.userId) {
      markAsRead(roomId, user.userId);
    }
  }, [roomId, user?.userId]);

  // ✅ 읽음 처리 함수
  async function markAsRead(roomId, userId) {
    const roomRef = doc(db, "chatRooms", roomId);
    await updateDoc(roomRef, {
      [`unread.${String(userId)}`]: 0,
    });
  }

  // ✅ 메시지 전송
  async function sendMessage() {
    if (!input.trim()) return;
    const senderId = String(user.userId);

    const messageRef = collection(db, "chatRooms", roomId, "messages");
    await addDoc(messageRef, {
      text: input,
      senderId,
      createdAt: serverTimestamp(),
    });

    // 방 메타데이터 업데이트 (lastMessage + unread 증가)
    const roomRef = doc(db, "chatRooms", roomId);
    // peerId 찾기 (현재 참여자 중 내가 아닌 사람)
    // ⚠️ 여기서는 participants 배열이 room 문서에 있다고 가정
    const peerId = (await (await import("firebase/firestore")).getDoc(roomRef)).data()
      .participants.find((id) => id !== senderId);

    await updateDoc(roomRef, {
      lastMessage: {
        text: input,
        senderId,
        createdAt: serverTimestamp(),
      },
      [`unread.${peerId}`]: increment(1),
    });

    setInput("");
  }

  return (
    <div style={{ padding: "16px" }}>
      <h2>채팅방</h2>
      <div
        style={{
          border: "1px solid #ccc",
          padding: "8px",
          height: "400px",
          overflowY: "auto",
          marginBottom: "8px",
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              textAlign: msg.senderId === String(user.userId) ? "right" : "left",
              marginBottom: "6px",
            }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "6px 10px",
                borderRadius: "12px",
                background:
                  msg.senderId === String(user.userId) ? "#4caf50" : "#eee",
                color: msg.senderId === String(user.userId) ? "white" : "black",
              }}
            >
              {msg.text}
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ flex: 1, padding: "8px" }}
          placeholder="메시지를 입력하세요..."
        />
        <button onClick={sendMessage} style={{ marginLeft: "8px" }}>
          전송
        </button>
      </div>
    </div>
  );
}
