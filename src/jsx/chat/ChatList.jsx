import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../../libs/firebase";
import useChatStore from "../../api/chatStore";
import api from "../../api/axios";

// ⚠️ 경고 아이콘
import WarningIcon from "../../image/home/warning.svg";

export default function ChatList() {
  const { rooms, setRooms, updateRoomLastMessage } = useChatStore();
  const navigate = useNavigate();

  // ✅ 이미 구독한 roomId를 추적하기 위한 Set
  const subscribedRef = useRef(new Set());

  // ✅ 채팅방 목록 불러오기
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const resp = await api.get("/matches");
        setRooms(resp.data); // [{ peer, roomId, matchedAt }]
      } catch (err) {
        console.error("❌ 채팅방 목록 불러오기 실패", err);
      }
    };
    fetchRooms();
  }, [setRooms]);

  // ✅ Firestore 마지막 메시지 구독 (중복 방지)
  useEffect(() => {
    if (!rooms || rooms.length === 0) return;

    const unsubscribes = [];

    rooms.forEach((room) => {
      if (subscribedRef.current.has(room.roomId)) return; // ✅ 중복 구독 방지
      subscribedRef.current.add(room.roomId);

      const q = query(
        collection(db, "chatRooms", room.roomId, "messages"),
        orderBy("createdAt", "desc"),
        limit(1)
      );

      const unsub = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const lastMsg = snapshot.docs[0].data();
          updateRoomLastMessage(room.roomId, {
            text: lastMsg.text,
            createdAt: lastMsg.createdAt?.toDate
              ? lastMsg.createdAt.toDate()
              : new Date(),
          });
        }
      });

      unsubscribes.push(unsub);
    });

    // ✅ cleanup
    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, [rooms, updateRoomLastMessage]);

  // ✅ 시간 포맷
  const formatTime = (date) => {
    if (!date) return "";
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div style={{ padding: "10px" }}>
      <h2 style={{ marginBottom: "15px" }}>내 채팅방</h2>

      {rooms.length === 0 ? (
        // ✅ 빈 상태 표시
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
              marginBottom: "1rem",
              margin: "0 auto",
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
          {rooms.map((room) => (
            <li
              key={room.roomId}
              onClick={() =>
                navigate(`/chat/${room.roomId}`, { state: { peer: room.peer } })
              }
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 8px",
                borderBottom: "1px solid #eee",
              }}
            >
              {/* 프로필 + 닉네임 + 마지막 메시지 */}
              <div style={{ display: "flex", alignItems: "center" }}>
                <img
                  src={room.peer.typeImageUrl}
                  alt="프로필"
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    marginRight: "12px",
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
                    {room.peer.nickname || room.peer.name}
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

              {/* 마지막 메시지 시간 */}
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "#888",
                  marginLeft: "8px",
                  whiteSpace: "nowrap",
                }}
              >
                {room.lastMessage?.createdAt
                  ? formatTime(room.lastMessage.createdAt)
                  : ""}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
