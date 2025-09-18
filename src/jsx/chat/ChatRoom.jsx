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
  getDoc,
} from "firebase/firestore";
import { db } from "../../libs/firebase";
import useUserStore from "../../api/userStore";

import { FaArrowUp } from "react-icons/fa";
import "../../css/chat/ChatRoom.css";
import YouProfile from "../mypage/YouProfile.jsx";


export default function ChatRoom() {
  const { roomId } = useParams();
  const { user } = useUserStore();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [roomInfo, setRoomInfo] = useState(null);

  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    if (!roomId) return;
    const roomRef = doc(db, "chatRooms", roomId);
    getDoc(roomRef).then((snap) => {
      if (snap.exists()) setRoomInfo(snap.data());
    });
  }, [roomId]);

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

      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const msg = change.doc.data();
          if (String(msg.senderId) !== String(user.userId)) {
            markAsRead(roomId, user.userId);
          }
        }
      });
    });
    return () => unsub();
  }, [roomId, user?.userId]);

  useEffect(() => {
    if (roomId && user?.userId) {
      markAsRead(roomId, user.userId);
    }
  }, [roomId, user?.userId]);

  async function markAsRead(roomId, userId) {
    const roomRef = doc(db, "chatRooms", roomId);
    await updateDoc(roomRef, { [`unread.${String(userId)}`]: 0 });
  }

  async function sendMessage() {
    if (!input.trim()) return;
    const senderId = String(user.userId);

    const messageRef = collection(db, "chatRooms", roomId, "messages");
    await addDoc(messageRef, {
      text: input,
      senderId,
      createdAt: serverTimestamp(),
    });

    const roomRef = doc(db, "chatRooms", roomId);
    const roomSnap = await getDoc(roomRef);
    const participants = (roomSnap.data()?.participants || []).map(String);
    const peerId = participants.find((id) => id !== senderId);

    await updateDoc(roomRef, {
      lastMessage: { text: input, senderId, createdAt: serverTimestamp() },
      [`unread.${peerId}`]: increment(1),
    });

    setInput("");
  }

  // ✅ 내 아이디와 상대 아이디 구분 확실히
  const myId = String(user.userId);
  const participants = roomInfo?.participants?.map(String) || [];
  const peerId = participants.find((id) => id !== myId) || null;
  const peerData = peerId ? roomInfo?.peers?.[peerId] : null;

  return (
    <div className="chatroom">
      {/* 헤더 */}
      <div className="chatroom-header">
        <button className="back-btn">←</button>
        {peerData ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
            }}
            onClick={() => setShowProfile(true)}
          >
            <img
              src={peerData.typeImageUrl}
              alt="avatar"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
            <div>
              <div style={{ fontWeight: "bold" }}>{peerData.name}</div>
              <div style={{ fontSize: "0.8rem", color: "#666" }}>
                {peerData.department}
              </div>
            </div>
          </div>
        ) : (
          <span className="title">채팅방</span>
        )}
      </div>

      {/* 메시지 영역 */}
      <div className="chatroom-messages">
        {messages.map((msg) => {
          const isMe = String(msg.senderId) === myId;
          const senderData = roomInfo?.peers?.[String(msg.senderId)] || {};
          return (
            <div key={msg.id} className={`chat-msg ${isMe ? "me" : "other"}`}>
              {!isMe && (
                <img
                  src={senderData.typeImageUrl}
                  alt="avatar"
                  className="avatar"
                  onClick={() => setShowProfile(true)}
                  style={{ cursor: "pointer" }}
                />
              )}
              <div className="bubble-wrap">
                {!isMe && senderData.name && (
                  <div className="name">{senderData.name}</div>
                )}
                <div className="bubble">{msg.text}</div>
                <div className="time">
                  {msg.createdAt?.toDate
                    ? msg.createdAt
                        .toDate()
                        .toLocaleTimeString("ko-KR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                    : ""}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 입력창 */}
      <div className="chatroom-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="메세지를 입력해주세요."
        />
        <button className="send-btn" onClick={sendMessage}>
          <FaArrowUp size={20} color="white" />
        </button>
      </div>

      {/* 상대 프로필 모달 */}
      {showProfile && peerId && (
        <div className="modal-overlay" onClick={() => setShowProfile(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <YouProfile userId={peerId} />
          </div>
        </div>
      )}
    </div>
  );
}
