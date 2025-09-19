import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  increment,
  getDoc,
  runTransaction,
  deleteDoc,
} from "firebase/firestore";
import { db, auth } from "../../libs/firebase";
import { onAuthStateChanged } from "firebase/auth";
import useUserStore from "../../api/userStore";
import useChatStore from "../../api/chatStore";
import { FaArrowUp } from "react-icons/fa";
import "../../css/chat/ChatRoom.css";
import YouProfile from "../mypage/YouProfile.jsx";

import { AnimatePresence, motion } from "framer-motion"; // ✅ 추가
import Loader from "../common/Loader"; // ✅ 추가

export default function ChatRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { addDeletedRoom } = useChatStore();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [roomInfo, setRoomInfo] = useState(null);
  const [sending, setSending] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const [pageLoading, setPageLoading] = useState(true); // ✅ 추가

  const myIdNum = Number(user?.userId);
  const myIdStr = Number.isFinite(myIdNum) ? String(myIdNum) : "";

  const chatroomRef = useRef(null);
  const messagesWrapRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const inputWrapperRef = useRef(null);

  // Firebase Auth 준비
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, () => setAuthReady(true));
    return unsub;
  }, []);

  // body 스크롤 막기
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // 방 정보 불러오기
  useEffect(() => {
    if (!authReady || !roomId) return;
    const roomRef = doc(db, "chatRooms", roomId);
    getDoc(roomRef)
      .then((snap) => {
        if (snap.exists()) {
          setRoomInfo(snap.data());
          setPageLoading(false); // ✅ 방 정보 로드 끝났을 때만 표시
        } else {
          navigate("/chat");
        }
      })
      .catch((e) => {
        console.error("[ChatRoom] getDoc room error:", e);
        setPageLoading(false);
      });
  }, [authReady, roomId, navigate]);

  const participants = useMemo(
    () => (roomInfo?.participants || []).map(Number),
    [roomInfo]
  );
  const peerIdNum = useMemo(
    () => participants.find((id) => id !== myIdNum) ?? null,
    [participants, myIdNum]
  );

  const peersByUserId = useMemo(() => {
    const out = {};
    const p = roomInfo?.peers || {};
    for (const k of Object.keys(p)) {
      const u = Number(p[k]?.userId);
      if (Number.isFinite(u)) out[u] = p[k];
    }
    return out;
  }, [roomInfo]);

  const peerData = peerIdNum != null ? peersByUserId[peerIdNum] ?? null : null;

  // ✅ 방 삭제 (나가기)
  async function handleLeaveRoom() {
    if (!roomId) return;
    const ok = window.confirm(
      "채팅방을 나가면 대화 내용이 모두 삭제됩니다. 나가시겠습니까?"
    );
    if (!ok) return;

    try {
      const roomRef = doc(db, "chatRooms", roomId);
      await deleteDoc(roomRef);
      addDeletedRoom(roomId);
      navigate("/chat");
    } catch (err) {
      console.error("채팅방 삭제 실패:", err);
      alert("채팅방을 나갈 수 없습니다.");
    }
  }

  // === 메시지 관련 함수들 ===
  const isNearBottom = useCallback(() => {
    const el = messagesWrapRef.current;
    if (!el) return true;
    const threshold = 120;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    return distance < threshold;
  }, []);

  const smartScrollToBottom = useCallback(
    (force = false) => {
      if (force || isNearBottom()) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 30);
      }
    },
    [isNearBottom]
  );

  const markAsRead = useCallback(async (roomId, userIdStr) => {
    try {
      const roomRef = doc(db, "chatRooms", roomId);
      await updateDoc(roomRef, { [`unread.${userIdStr}`]: 0 });
    } catch (e) {
      console.warn("markAsRead failed", e);
    }
  }, []);

  const maybeMarkAsRead = useCallback(
    (list) => {
      if (!roomId || !myIdStr || !Array.isArray(list) || list.length === 0)
        return;
      if (document.visibilityState !== "visible") return;
      if (typeof window !== "undefined" && !document.hasFocus()) return;

      const last = list[list.length - 1];
      if (Number(last?.senderId) !== myIdNum) {
        markAsRead(roomId, myIdStr);
      }
    },
    [roomId, myIdStr, myIdNum, markAsRead]
  );

  // 메시지 구독
  useEffect(() => {
    if (!authReady || !roomId) return;
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

      const added = snapshot.docChanges().some((c) => c.type === "added");
      if (added) maybeMarkAsRead(newMessages);
      smartScrollToBottom();
    });

    return () => unsub();
  }, [authReady, roomId, myIdNum, maybeMarkAsRead, smartScrollToBottom]);

  // 최초 입장 시 읽음 처리
  useEffect(() => {
    if (authReady && roomId && myIdStr) {
      markAsRead(roomId, myIdStr);
    }
  }, [authReady, roomId, myIdStr, markAsRead]);

  const fade = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.35 } },
    exit: { opacity: 0, transition: { duration: 0.35 } },
  };

  return (
    <>
      <AnimatePresence mode="sync">
        {!pageLoading && (
          <motion.div key="chatroom" {...fade}>
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
                      flex: 1,
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
                  <span className="title" style={{ flex: 1 }}>
                    채팅방
                  </span>
                )}
                <button
                  className="leave-btn"
                  onClick={handleLeaveRoom}
                  style={{
                    marginLeft: "auto",
                    background: "none",
                    border: "none",
                    fontSize: "0.9rem",
                    color: "#e74c3c",
                    cursor: "pointer",
                  }}
                >
                  나가기
                </button>
              </div>

              {/* 메시지 영역 */}
              <div className="chatroom-messages" ref={messagesWrapRef}>
                {messages.map((msg) => {
                  const isMe = Number(msg.senderId) === myIdNum;
                  const senderData =
                    peersByUserId[Number(msg.senderId)] || {};
                  return (
                    <div
                      key={msg.id}
                      className={`chat-msg ${isMe ? "me" : "other"}`}
                    >
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
                            ? msg.createdAt.toDate().toLocaleTimeString(
                                "ko-KR",
                                { hour: "2-digit", minute: "2-digit" }
                              )
                            : ""}
                        </div>
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
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (!sending) sendMessage();
                    }
                  }}
                  placeholder="메세지를 입력해주세요."
                  disabled={sending || !Number.isFinite(myIdNum) || !roomId}
                />
                <button
                  type="button"
                  className="send-btn"
                  onClick={sendMessage}
                  disabled={
                    sending || !input.trim() || !Number.isFinite(myIdNum) || !roomId
                  }
                  aria-busy={sending}
                >
                  <FaArrowUp size={20} color="white" />
                </button>
              </div>

              {/* 상대방 프로필 모달 */}
              {showProfile && peerIdNum != null && (
                <div
                  className="modal-overlay"
                  onClick={() => setShowProfile(false)}
                >
                  <div
                    className="modal-content"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <YouProfile
                      userId={peerIdNum}
                      onClose={() => setShowProfile(false)}
                      fromMatching={false}
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ 오버레이 로딩 */}
      {pageLoading && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 2000,
          }}
        >
          <Loader />
        </div>
      )}
    </>
  );
}
