import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../../libs/firebase";
import useChatStore from "../../api/chatStore";
import useUserStore from "../../api/userStore"; // ✅ 내 userId 가져오기
import api from "../../api/axios";
import WarningIcon from "../../image/home/warning.svg";

export default function ChatList() {
  const { rooms, setRooms, updateRoomLastMessage } = useChatStore();
  const navigate = useNavigate();
  const user = useUserStore((s) => s.user);
  const userId = user?.userId;

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const resp = await api.get("/matches");
        setRooms(resp.data);
      } catch (err) {
        console.error("❌ 채팅방 목록 불러오기 실패", err);
      }
    };
    fetchRooms();
  }, [setRooms]);

  // ✅ Firestore 마지막 메시지 구독
  useEffect(() => {
    const unsubscribes = rooms.map((room) => {
      const q = query(
        collection(db, "chatRooms", room.roomId, "messages"),
        orderBy("createdAt", "desc"),
        limit(1)
      );

      return onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const lastMsg = snapshot.docs[0].data();
          updateRoomLastMessage(room.roomId, {
            text: lastMsg.text,
            createdAt: lastMsg.createdAt?.toDate
              ? lastMsg.createdAt.toDate()
              : null,
            readBy: lastMsg.readBy || [],
            senderId: lastMsg.senderId,
          });
        }
      });
    });

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, [rooms, updateRoomLastMessage]);

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
            const last = room.lastMessage;
            const isUnread =
              last &&
              last.senderId !== userId && // 내가 보낸 게 아니고
              !last.readBy?.includes(userId); // 내가 아직 안 읽음

            return (
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
                        color: isUnread ? "#000" : "#555",
                        fontWeight: isUnread ? "bold" : "normal",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "200px",
                      }}
                    >
                      {last?.text || "대화를 시작해보세요!"}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: "4px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.8rem",
                      color: "#888",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {last?.createdAt ? formatTime(last.createdAt) : ""}
                  </span>
                  {isUnread && (
                    <span
                      style={{
                        display: "inline-block",
                        width: "8px",
                        height: "8px",
                        backgroundColor: "red",
                        borderRadius: "50%",
                      }}
                    />
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
