import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../libs/firebase";
import useUserStore from "../../api/userStore";

export default function ChatRoom() {
  const { roomId } = useParams();
  const location = useLocation();
  const peer = location.state?.peer; // ChatList에서 넘어온 peer 정보

  const user = useUserStore((s) => s.user);
  const userId = user?.userId;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // ✅ 방 존재 확인 & 없으면 생성
  useEffect(() => {
    if (!roomId || !userId) return;

    const ensureRoom = async () => {
      const roomRef = doc(db, "chatRooms", roomId);
      const snap = await getDoc(roomRef);
      if (!snap.exists()) {
        await setDoc(roomRef, {
          createdAt: serverTimestamp(),
          participants: [userId, peer?.userId].filter(Boolean),
          peerInfo: peer || null,
          lastMessage: "",
          lastMessageAt: null,
        });
        console.log("🟢 Firestore 방 생성:", roomId);
      }
    };

    ensureRoom();
  }, [roomId, userId, peer]);

  // ✅ Firestore 메시지 구독
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

  // ✅ 메시지 전송
  const sendMessage = async () => {
    if (!input.trim() || !userId) return;

    try {
      const roomRef = doc(db, "chatRooms", roomId);

      // 메시지 저장
      await addDoc(collection(roomRef, "messages"), {
        senderId: userId,
        text: input,
        createdAt: serverTimestamp(),
      });

      // lastMessage 갱신
      await updateDoc(roomRef, {
        lastMessage: input,
        lastMessageAt: serverTimestamp(),
      });

      setInput("");
    } catch (err) {
      console.error("❌ 메시지 전송 실패:", err);
    }
  };

  return (
    <div className="chat-room">
      {/* 🔹 상대방 프로필 표시 */}
      {peer && (
        <div
          style={{
            borderBottom: "1px solid #ddd",
            paddingBottom: "10px",
            marginBottom: "10px",
          }}
        >
          <h3>
            {peer.nickname || peer.name} ({peer.department})
          </h3>
          {peer.introduce && <p>{peer.introduce}</p>}
          <div>
            <img src={peer.typeImageUrl} alt="type1" width={60} />
            {peer.typeImageUrl2 && (
              <img src={peer.typeImageUrl2} alt="type2" width={60} />
            )}
          </div>
        </div>
      )}

      {/* 🔹 메시지 목록 */}
      <div
        className="chat-messages"
        style={{
          height: "300px",
          overflowY: "auto",
          border: "1px solid #ddd",
          padding: "10px",
        }}
      >
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              textAlign: m.senderId === userId ? "right" : "left",
              margin: "5px 0",
            }}
          >
            <b>{m.senderId === userId ? "나" : peer?.nickname || peer?.name}</b>
            : {m.text}
          </div>
        ))}
      </div>

      {/* 🔹 입력창 */}
      <div
        className="chat-input"
        style={{ marginTop: "10px", display: "flex" }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="메시지 입력"
          style={{ flex: 1 }}
        />
        <button type="button" onClick={sendMessage}>
          전송
        </button>
      </div>
    </div>
  );
}
