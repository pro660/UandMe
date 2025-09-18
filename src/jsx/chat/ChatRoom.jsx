// src/jsx/chat/ChatRoom.jsx
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  runTransaction,
} from "firebase/firestore";
import { db } from "../../libs/firebase";
import useUserStore from "../../api/userStore";
import { FaArrowUp } from "react-icons/fa";
import "../../css/chat/ChatRoom.css";
import YouProfile from "../mypage/YouProfile.jsx";

export default function ChatRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useUserStore();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [roomInfo, setRoomInfo] = useState(null);
  const [sending, setSending] = useState(false);

  // ✅ 모달 상태
  const [showProfile, setShowProfile] = useState(false);

  // ✅ 내 아이디 문자열 고정
  const myId = String(user?.userId || "");

  // ✅ ref
  const chatroomRef = useRef(null);
  const messagesWrapRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const inputWrapperRef = useRef(null);

  // ✅ body 스크롤 막기
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // ✅ 방 정보 불러오기
  useEffect(() => {
    if (!roomId) return;
    const roomRef = doc(db, "chatRooms", roomId);
    getDoc(roomRef).then((snap) => {
      if (snap.exists()) setRoomInfo(snap.data());
      else navigate("/chat"); // 방이 없으면 리스트로
    });
  }, [roomId, navigate]);

  // ✅ 상대방 정보 계산 (memo)
  const participants = useMemo(
    () => (roomInfo?.participants || []).map(String),
    [roomInfo]
  );
  const peerId = useMemo(
    () => participants.find((id) => id !== myId) || null,
    [participants, myId]
  );
  const peerData = peerId ? roomInfo?.peers?.[peerId] : null;

  // ✅ 메시지 실시간 구독
  useEffect(() => {
    if (!roomId) return;

    const q = query(
      collection(db, "chatRooms", roomId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setMessages(newMessages);

      // 새 메시지 added 체크해 읽음 처리(필요할 때만)
      const added = snapshot.docChanges().some((c) => c.type === "added");
      if (added) maybeMarkAsRead(newMessages);
      // 오토스크롤
      smartScrollToBottom();
    });

    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, myId]);

  // ✅ 포커스/가시 상태 변화 시 읽음 처리
  useEffect(() => {
    const onFocusOrVisible = () => maybeMarkAsRead(messages);
    window.addEventListener("focus", onFocusOrVisible);
    document.addEventListener("visibilitychange", onFocusOrVisible);
    return () => {
      window.removeEventListener("focus", onFocusOrVisible);
      document.removeEventListener("visibilitychange", onFocusOrVisible);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, myId, roomId]);

  // ✅ 최초 입장 시 읽음 초기화
  useEffect(() => {
    if (roomId && myId) {
      markAsRead(roomId, myId);
    }
  }, [roomId, myId]);

  // ✅ iOS Safari 키보드 대응(뷰포트 변화)
  useEffect(() => {
    const handleResize = () => {
      if (!chatroomRef.current || !inputWrapperRef.current) return;
      chatroomRef.current.style.height = `${window.innerHeight}px`;
      inputWrapperRef.current.style.bottom = "0px";
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function isNearBottom() {
    const el = messagesWrapRef.current;
    if (!el) return true;
    const threshold = 120; // px
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    return distance < threshold;
  }

  function smartScrollToBottom(force = false) {
    if (force || isNearBottom()) {
      // 새 메시지가 왔을 때만 자연스럽게
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 30);
    }
  }

  async function markAsRead(roomId, userId) {
    try {
      const roomRef = doc(db, "chatRooms", roomId);
      await updateDoc(roomRef, { [`unread.${String(userId)}`]: 0 });
    } catch (e) {
      console.warn("markAsRead failed", e);
    }
  }

  // 마지막 메시지가 상대가 보낸 것이고, 포커스/가시 상태일 때만 읽음 반영
  function maybeMarkAsRead(list) {
    if (!roomId || !myId || !Array.isArray(list) || list.length === 0) return;
    if (document.visibilityState !== "visible") return;
    if (typeof window !== "undefined" && !document.hasFocus()) return;

    const last = list[list.length - 1];
    if (String(last?.senderId) !== myId) {
      markAsRead(roomId, myId);
    }
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text) return;
    if (!myId || !roomId) return;
    if (!roomInfo?.participants?.length) return;

    setSending(true);
    try {
      // ✅ 트랜잭션으로 메시지 생성 + 룸 메타 동시 갱신 (레이스 방지)
      const roomRef = doc(db, "chatRooms", roomId);
      const msgRef = doc(collection(db, "chatRooms", roomId, "messages"));

      await runTransaction(db, async (tx) => {
        const snap = await tx.get(roomRef);
        if (!snap.exists()) throw new Error("Room not found");
        const data = snap.data() || {};
        const parts = (data.participants || []).map(String);
        const receiverId = parts.find((id) => id !== myId);
        if (!receiverId) throw new Error("Peer not found");

        tx.set(msgRef, {
          text,
          senderId: myId,
          createdAt: serverTimestamp(),
        });

        tx.update(roomRef, {
          lastMessage: { text, senderId: myId, createdAt: serverTimestamp() },
          [`unread.${receiverId}`]: increment(1),
        });
      });

      setInput("");
      // 전송 후 포커스 유지 + 스크롤
      inputRef.current?.focus();
      smartScrollToBottom(true);
    } catch (e) {
      console.error("sendMessage failed:", e);
      // TODO: 토스트 등 사용자 피드백 연결 가능
    } finally {
      setSending(false);
    }
  }

  // Enter로 전송
  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!sending) sendMessage();
    }
  }

  // 메시지 시간 포맷 (createdAt 없을 수 있음: 대기중 로컬변이)
  function formatTime(ts) {
    try {
      if (!ts?.toDate) return "";
      return ts.toDate().toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  }

  return (
    <div className="chatroom" ref={chatroomRef}>
      {/* 상단 헤더 */}
      <div className="chatroom-header">
        <button className="back-btn" onClick={() => navigate("/chat")}>
          ←
        </button>
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
      <div className="chatroom-messages" ref={messagesWrapRef}>
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
                <div className="time">{formatTime(msg.createdAt)}</div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력창 */}
      <div className="chatroom-input" ref={inputWrapperRef}>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            !myId
              ? "로그인 정보를 불러오는 중..."
              : !roomId
              ? "채팅방 정보를 불러오는 중..."
              : "메세지를 입력해주세요."
          }
          disabled={sending || !myId || !roomId}
        />
        <button
          type="button"
          className="send-btn"
          onClick={sendMessage}
          disabled={sending || !input.trim() || !myId || !roomId}
          aria-busy={sending}
        >
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
            <YouProfile userId={peerId} onClose={() => setShowProfile(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
