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

  // ✅ 모달 상태
  const [showProfile, setShowProfile] = useState(false);

  // ✅ 방 정보 불러오기
  useEffect(() => {
    if (!roomId) return;
    const roomRef = doc(db, "chatRooms", roomId);
    getDoc(roomRef).then((snap) => {
      if (snap.exists()) {
        setRoomInfo(snap.data());
      }
    });
  }, [roomId]);

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

  // ✅ 방 입장 시 unread 초기화
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
    const senderId = String(user.userId); // ✅ 문자열 고정

    const messageRef = collection(db, "chatRooms", roomId, "messages");
    await addDoc(messageRef, {
      text: input,
      senderId, // ✅ 문자열 저장
      createdAt: serverTimestamp(),
    });

    // 방 메타데이터 업데이트
    const roomRef = doc(db, "chatRooms", roomId);
    const roomSnap = await getDoc(roomRef);
    const participants = roomSnap.data()?.participants || [];
    const peerId = participants.find((id) => String(id) !== senderId);

    await updateDoc(roomRef, {
      lastMessage: {
        text: input,
        senderId,
        createdAt: serverTimestamp(),
      },
      [`unread.${String(peerId)}`]: increment(1),
    });

    setInput("");
  }

  // ✅ 상대방 정보 추출 (내 userId 제외)
  const peerId =
    roomInfo?.participants?.find((id) => String(id) !== String(user.userId)) ||
    null;
  const peerData = peerId ? roomInfo?.peers?.[String(peerId)] : null;

  return (
    <div className="chatroom">
      {/* 상단 헤더 */}
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
          const isMe = String(msg.senderId) === String(user.userId); // ✅ 문자열 비교
          const senderData = roomInfo?.peers?.[String(msg.senderId)] || {};
          return (
            <div key={msg.id} className={`chat-msg ${isMe ? "me" : "other"}`}>
              {!isMe && (
                <img
                  src={senderData.typeImageUrl}
                  alt="avatar"
                  className="avatar"
                  onClick={() => setShowProfile(true)} // ✅ 메시지 아바타 클릭도 모달 오픈
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
                    ? msg.createdAt.toDate().toLocaleTimeString("ko-KR", {
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

      {/* 상대방 프로필 모달 */}
      {showProfile && peerId && (
        <div className="modal-overlay" onClick={() => setShowProfile(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <YouProfile userId={peerId} />
          </div>
        </div>
      )}
    </div>
  );
}
