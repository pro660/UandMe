// src/jsx/chat/ChatRoomDummy.jsx
import { useEffect, useRef, useState } from "react";
import { FaArrowUp } from "react-icons/fa";
import "../../css/chat/ChatRoom.css";
import YouProfile from "../mypage/YouProfile.jsx"; // 더미에서 모달 띄울 경우

export default function ChatRoomDummy() {
  // 상태값
  const [messages, setMessages] = useState([
    { id: "1", senderId: 1, text: "안녕 👋", createdAt: new Date() },
    { id: "2", senderId: 2, text: "어? 반가워!", createdAt: new Date() },
    { id: "3", senderId: 1, text: "더미 테스트 중이야", createdAt: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  // 내 아이디 (더미)
  const myIdNum = 1;
  const peerIdNum = 2;
  const peerData = {
    name: "상대방",
    department: "컴퓨터공학과",
    typeImageUrl: "https://via.placeholder.com/36", // 더미 아바타
  };

  // 모달 상태
  const [showProfile, setShowProfile] = useState(false);

  // ref
  const messagesEndRef = useRef(null);

  // 더미 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 메시지 보내기 (더미)
  function sendMessage() {
    const text = input.trim();
    if (!text) return;

    setSending(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), senderId: myIdNum, text, createdAt: new Date() },
      ]);
      setInput("");
      setSending(false);
    }, 300);
  }

  // Enter 전송
  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!sending) sendMessage();
    }
  }

  function formatTime(ts) {
    try {
      return ts?.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  }

  return (
    <div className="chatroom">
      {/* 상단 헤더 */}
      <div className="chatroom-header">
        <button className="back-btn" onClick={() => alert("뒤로가기 (더미)")}>
          ←
        </button>
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
      </div>

      {/* 메시지 영역 */}
      <div className="chatroom-messages">
        {messages.map((msg) => {
          const isMe = msg.senderId === myIdNum;
          return (
            <div key={msg.id} className={`chat-msg ${isMe ? "me" : "other"}`}>
              {!isMe && (
                <img
                  src={peerData.typeImageUrl}
                  alt="avatar"
                  className="avatar"
                  onClick={() => setShowProfile(true)}
                  style={{ cursor: "pointer" }}
                />
              )}
              <div className="bubble-wrap">
                {!isMe && <div className="name">{peerData.name}</div>}
                <div className="bubble">{msg.text}</div>
                <div className="time">{formatTime(msg.createdAt)}</div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력창 */}
      <div className="chatroom-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="메세지를 입력해주세요."
          disabled={sending}
        />
        <button
          type="button"
          className="send-btn"
          onClick={sendMessage}
          disabled={sending || !input.trim()}
          aria-busy={sending}
        >
          <FaArrowUp size={20} color="white" />
        </button>
      </div>

      {/* 상대방 프로필 모달 */}
      {showProfile && (
        <div className="modal-overlay" onClick={() => setShowProfile(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* 더미에서도 같은 YouProfile 사용 가능 */}
            <YouProfile userId={peerIdNum} onClose={() => setShowProfile(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
