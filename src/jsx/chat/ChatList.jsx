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

  useEffect(() => {
    if (!user?.userId) return;

    const q = query(
      collection(db, "chatRooms"),
      where("participants", "array-contains", String(user.userId))
    );

    setLoading(true);
    const unsub = onSnapshot(
      q,
      { includeMetadataChanges: true },
      (snapshot) => {
        let updatedRooms = [];

        snapshot.docChanges().forEach((change) => {
          if (change.type === "removed") {
            updatedRooms.push({
              roomId: change.doc.id,
              deleted: true,
            });
          } else {
            updatedRooms.push({
              roomId: change.doc.id,
              ...change.doc.data(),
            });
          }
        });

        // ✅ 정렬: 삭제된 방은 무조건 맨 아래, 나머지는 최신순
        updatedRooms.sort((a, b) => {
          if (a.deleted && !b.deleted) return 1;
          if (!a.deleted && b.deleted) return -1;

          const aTime = a.lastMessage?.createdAt?.seconds || 0;
          const bTime = b.lastMessage?.createdAt?.seconds || 0;
          return bTime - aTime;
        });

        setRooms(updatedRooms);
        setLoading(false);
      }
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
          {rooms.map((room) =>
            room.deleted ? (
              <li
                key={room.roomId}
                style={{
                  padding: "12px 8px",
                  borderBottom: "1px solid #eee",
                  color: "#c0392b",
                  fontStyle: "italic",
                  background: "#fceaea",
                  borderRadius: "6px",
                  marginBottom: "6px",
                  cursor: "not-allowed",
                  opacity: 0.7,
                }}
              >
                ❌ 이 채팅방은 삭제되었습니다
              </li>
            ) : (
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
                    src={room.peers?.[String(user.userId)]?.typeImageUrl}
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
                      {room.peers?.[String(user.userId)]?.nickname ||
                        room.peers?.[String(user.userId)]?.name}
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
                    {room.lastMessage?.createdAt
                      ? new Date(
                          room.lastMessage.createdAt.seconds * 1000
                        ).toLocaleTimeString("ko-KR", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })
                      : ""}
                  </div>

                  {room.unread?.[String(user.userId)] > 0 && (
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
                      {room.unread?.[String(user.userId)]}
                    </div>
                  )}
                </div>
              </li>
            )
          )}
        </ul>
      )}
    </div>
  );
}
