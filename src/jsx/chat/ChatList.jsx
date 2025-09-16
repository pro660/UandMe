import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../libs/firebase";
import WarningIcon from "../../image/home/warning.svg";

export default function ChatList() {
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();

  // ✅ Firestore 실시간 구독
  useEffect(() => {
    const q = query(collection(db, "chatRooms"), orderBy("lastMessageAt", "desc"));

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        roomId: doc.id,
        ...doc.data(),
      }));
      setRooms(data);
    });

    return () => unsub();
  }, []);

  const formatTime = (ts) => {
    if (!ts?.toDate) return "";
    return ts.toDate().toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

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
              marginBottom: "1rem",
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
                navigate(`/chat/${room.roomId}`, { state: { peer: room.peerInfo } })
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
                  src={room.peerInfo?.typeImageUrl}
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
                    {room.peerInfo?.nickname || room.peerInfo?.name}
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
                    {room.lastMessage || "대화를 시작해보세요!"}
                  </div>
                </div>
              </div>
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "#888",
                  marginLeft: "8px",
                  whiteSpace: "nowrap",
                }}
              >
                {formatTime(room.lastMessageAt)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
