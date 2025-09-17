import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../libs/firebase";
import useUserStore from "../../api/userStore";

export default function ChatRoom() {
  const { roomId } = useParams();
  const { user } = useUserStore();
  const userId = user?.userId;

  const [peer, setPeer] = useState(null); // ✅ 상대방 정보 Firestore에서 가져옴
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // ✅ Firestore 방 정보 읽기 (peers에서 상대방 꺼내기)
  useEffect(() => {
    if (!roomId || !userId) return;

    const fetchRoomInfo = async () => {
      try {
        const roomRef = doc(db, "chatRooms", roomId);
        const snap = await getDoc(roomRef);
        if (snap.exists()) {
          const data = snap.data();
          // 내 ID 기준으로 상대방 정보 꺼내기
          const peerInfo = data.peers?.[userId];
          setPeer(peerInfo || null);
        }
      } catch (err) {
        console.error("❌ Firestore 방 정보 불러오기 실패:", err);
      }
    };

    fetchRoomInfo();
  }, [roomId, userId]);

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
      await addDoc(collection(db, "chatRooms", roomId, "messages"), {
        senderId: userId,
        text: input,
        createdAt: serverTimestamp(),
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
          <img src={peer.typeImageUrl} alt="type1" width={60} />
          {peer.typeImageUrl2 && (
            <img src={peer.typeImageUrl2} alt="type2" width={60} />
          )}
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
