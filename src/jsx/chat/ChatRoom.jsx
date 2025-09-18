// src/jsx/chat/ChatRoom.jsx
import { useEffect, useMemo, useRef, useState } from "react";
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
} from "firebase/firestore";
import { db } from "../../libs/firebase";
import { auth } from "../../libs/firebase";
import { onAuthStateChanged } from "firebase/auth";
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
  const [authReady, setAuthReady] = useState(false); // ✅ 익명 로그인 완료 가드

  // ✅ 모달 상태
  const [showProfile, setShowProfile] = useState(false);

  // ✅ 내 아이디 (숫자/문자열 동시 준비)
  const myIdNum = Number(user?.userId);
  const myIdStr = Number.isFinite(myIdNum) ? String(myIdNum) : "";

  // ✅ ref
  const chatroomRef = useRef(null);
  const messagesWrapRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const inputWrapperRef = useRef(null);

  // 🔐 Firebase Auth 준비되면 시작
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      // 디버그용: 현재 인증 상태 확인
      // console.log("[ChatRoom][Auth]", fbUser?.uid, fbUser?.isAnonymous);
      setAuthReady(true);
    });
    return unsub;
  }, []);

  // ✅ body 스크롤 막기
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // ✅ 방 정보 불러오기
  useEffect(() => {
    if (!authReady || !roomId) return;
    const roomRef = doc(db, "chatRooms", roomId);
    getDoc(roomRef)
      .then((snap) => {
        if (snap.exists()) setRoomInfo(snap.data());
        else navigate("/chat"); // 방이 없으면 리스트로
      })
      .catch((e) => console.error("[ChatRoom] getDoc room error:", e));
  }, [authReady, roomId, navigate]);

  // ✅ 참가자/상대 ID 계산 (숫자 기준)
  const participants = useMemo(
    () => (roomInfo?.participants || []).map(Number),
    [roomInfo]
  );
  const peerIdNum = useMemo(
    () => participants.find((id) => id !== myIdNum) ?? null,
    [participants, myIdNum]
  );
  const peerIdStr = peerIdNum != null ? String(peerIdNum) : null;

  // ✅ peers를 userId(숫자) -> 카드데이터로 역색인
  const peersByUserId = useMemo(() => {
    const out = {};
    const p = roomInfo?.peers || {};
    for (const k of Object.keys(p)) {
      const u = Number(p[k]?.userId);
      if (Number.isFinite(u)) out[u] = p[k];
    }
    return out;
  }, [roomInfo]);

  // 헤더에 띄울 상대 정보
  const peerData = peerIdNum != null ? peersByUserId[peerIdNum] ?? null : null;

  // ✅ 메시지 실시간 구독 (로그인 완료 후)
  useEffect(() => {
    if (!authReady || !roomId) return;

    const q = query(
      collection(db, "chatRooms", roomId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
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
      },
      (err) => {
        console.error("[ChatRoom] onSnapshot(messages) error:", err);
      }
    );

    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, roomId, myIdNum]);

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
  }, [messages, myIdNum, roomId]);

  // ✅ 최초 입장 시 읽음 초기화
  useEffect(() => {
    if (authReady && roomId && myIdStr) {
      markAsRead(roomId, myIdStr);
    }
  }, [authReady, roomId, myIdStr]);

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
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 30);
    }
  }

  async function markAsRead(roomId, userIdStr) {
    try {
      const roomRef = doc(db, "chatRooms", roomId);
      await updateDoc(roomRef, { [`unread.${userIdStr}`]: 0 });
    } catch (e) {
      console.warn("markAsRead failed", e);
    }
  }

  // 마지막 메시지가 상대가 보낸 것이고, 포커스/가시 상태일 때만 읽음 반영
  function maybeMarkAsRead(list) {
    if (!roomId || !myIdStr || !Array.isArray(list) || list.length === 0) return;
    if (document.visibilityState !== "visible") return;
    if (typeof window !== "undefined" && !document.hasFocus()) return;

    const last = list[list.length - 1];
    if (Number(last?.senderId) !== myIdNum) {
      markAsRead(roomId, myIdStr);
    }
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text) return;
    if (!Number.isFinite(myIdNum) || !roomId) return;
    if (!Array.isArray(roomInfo?.participants) || roomInfo.participants.length < 2)
      return;

    setSending(true);
    try {
      // ✅ 트랜잭션으로 메시지 생성 + 룸 메타 동시 갱신 (레이스 방지)
      const roomRef = doc(db, "chatRooms", roomId);
      const msgColRef = collection(db, "chatRooms", roomId, "messages");

      await runTransaction(db, async (tx) => {
        const snap = await tx.get(roomRef);
        if (!snap.exists()) throw new Error("Room not found");
        const data = snap.data() || {};
        const parts = (data.participants || []).map(Number);
        const receiverIdNum = parts.find((id) => id !== myIdNum);
        if (!Number.isFinite(receiverIdNum)) throw new Error("Peer not found");

        const newMsgRef = doc(msgColRef); // auto-id
        tx.set(newMsgRef, {
          text,
          senderId: myIdNum, // 숫자
          createdAt: serverTimestamp(),
        });

        tx.update(roomRef, {
          lastMessage: { text, senderId: myIdNum, createdAt: serverTimestamp() }, // 숫자
          [`unread.${String(receiverIdNum)}`]: increment(1), // 키는 문자열
        });
      });

      setInput("");
      inputRef.current?.focus(); // 필요 시 blur로 바꿔 키보드 닫기
      smartScrollToBottom(true);
    } catch (e) {
      console.error("sendMessage failed:", e);
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

  // 메시지 시간 포맷
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
          const isMe = Number(msg.senderId) === myIdNum;
          const senderData = peersByUserId[Number(msg.senderId)] || {};
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
            !Number.isFinite(myIdNum)
              ? "로그인 정보를 불러오는 중..."
              : !roomId
              ? "채팅방 정보를 불러오는 중..."
              : "메세지를 입력해주세요."
          }
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
        <div className="modal-overlay" onClick={() => setShowProfile(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <YouProfile userId={peerIdNum} onClose={() => setShowProfile(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
