import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../libs/firebase";
import useUserStore from "../../api/userStore";
import useChatStore from "../../api/chatStore";

// ⚠️ 경고 아이콘
import WarningIcon from "../../image/home/warning.svg";
import Loader from "../common/Loader"; // ✅ 로더 컴포넌트

export default function ChatList() {
  const { rooms, setRooms } = useChatStore();
  const { user } = useUserStore();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  // ✅ Time formatter (Timestamp | {seconds} 모두 대응)
  function formatTime(ts) {
    if (!ts) return "";
    const d = typeof ts.toDate === "function" ? ts.toDate() : (ts.seconds ? new Date(ts.seconds * 1000) : null);
    if (!d) return "";
    return d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: true });
  }

  // ✅ Firestore에서 내가 속한 채팅방 불러오기 (숫자 기준)
  useEffect(() => {
    const uid = Number(user?.userId);
    if (!Number.isFinite(uid)) return;

    const q = query(
      collection(db, "chatRooms"),
      // 🔄 CHANGED: 숫자 배열이므로 Number(uid) 로 검색
      where("participants", "array-contains", uid)
    );

    setLoading(true);
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const roomList = snapshot.docs.map((doc) => ({
          roomId: doc.id,
          ...doc.data(),
        }));
        setRooms(roomList);
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => unsub();
  }, [user?.userId, setRooms]);

  if (loading) {
    return (
      <div style={{ padding: "10px", textAlign: "center", marginTop: "5rem" }}>
        <Loader />
      </div>
    );
  }

  return (
    <div style={{ padding: "10px" }}>
      <h2 style={{ marginBottom: "15px" }}>내 채팅방</h2>

      {rooms.length === 0 ? (
        // ✅ 빈 상태
        <div
          style={{
            textAlign: "center",
            color: "#666",
            marginTop: "100px",
          }}
        >
          <img
            src={WarningIcon}
            alt="경고 아이콘"
            style={{
              width: "6rem",
              height: "6rem",
              display: "block",
              margin: "0 auto 1rem",
            }}
          />
          <p style={{ fontSize: "1.2rem", fontWeight: "bold", margin: 0 }}>
            아직 채팅이 시작되지 않았어요.
          </p>
          <p style={{ fontSize: "0.95rem", marginTop: "5px" }}>
            매칭을 하여 원하는 이성과 채팅을 시작하세요.
          </p>
        </div>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {rooms.map((room) => {
            const myIdNum = Number(user.userId);
            // 🔄 CHANGED: participants는 숫자 배열로 가정
            const parts = (room.participants || []).map(Number);
            const peerIdNum = parts.find((id) => id !== myIdNum);
            const peerIdStr = peerIdNum != null ? String(peerIdNum) : undefined;

            // 🔄 CHANGED: 상대 id로 peers 접근
            const peer = peerIdStr ? room.peers?.[peerIdStr] : undefined;

            // unread는 내 id 키로
            const unreadCount = room.unread?.[String(myIdNum)] || 0;

            return (
              <li
                key={room.roomId}
                onClick={() => navigate(`/chat/${room.roomId}`)}
                style={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 8px",
                  borderBottom: "1px solid #eee",
                }}
              >
                {/* 왼쪽: 프로필 + 이름 + 마지막 메시지 */}
                <div style={{ display: "flex", alignItems: "center" }}>
                  <img
                    src={peer?.typeImageUrl}
                    alt="프로필"
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      marginRight: "12px",
                      background: "#f2f2f2",
                    }}
                  />
                  <div>
                    <div
                      style={{
                        fontWeight: "bold",
                        fontSize: "1rem",
                        marginBottom: "4px",
                      }}
                    >
                      {peer?.nickname || peer?.name || "상대방"}
                    </div>
                    <div
                      style={{
                        fontSize: "0.9rem",
                        color: "#555",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "200px",
                      }}
                    >
                      {room.lastMessage?.text || "대화를 시작해보세요!"}
                    </div>
                  </div>
                </div>

                {/* 오른쪽: 시간 + 안읽음 뱃지 */}
                <div style={{ textAlign: "right", marginLeft: "8px" }}>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "#888",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatTime(room.lastMessage?.createdAt)}
                  </div>

                  {unreadCount > 0 && (
                    <div
                      style={{
                        marginTop: "4px",
                        background: "#ff4d4f",
                        color: "white",
                        borderRadius: "12px",
                        padding: "2px 8px",
                        fontSize: "0.8rem",
                        fontWeight: "bold",
                        display: "inline-block",
                        minWidth: "20px",
                        textAlign: "center",
                      }}
                    >
                      {unreadCount}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
