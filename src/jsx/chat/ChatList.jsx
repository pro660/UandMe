import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useChatStore from "../../api/chatStore";
import api from "../../api/axios";

export default function ChatList() {
  const { rooms, setRooms } = useChatStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const resp = await api.get("/chat/rooms");
        setRooms(resp.data); // [{ peer, roomId, matchedAt }]
      } catch (err) {
        console.error("❌ 채팅방 목록 불러오기 실패", err);
      }
    };
    fetchRooms();
  }, [setRooms]);

  return (
    <div>
      <h2>내 채팅방</h2>
      {rooms.length === 0 ? (
        <p>참여 중인 채팅방이 없습니다.</p>
      ) : (
        <ul>
          {rooms.map((room) => (
            <li
              key={room.roomId}
              onClick={() => navigate(`/chat/${room.roomId}`)}
              style={{ cursor: "pointer", padding: "10px 0", borderBottom: "1px solid #ddd" }}
            >
              <div><b>{room.peer.name}</b> ({room.peer.department})</div>
              {room.peer.introduce && (
                <div style={{ fontSize: "0.9rem", color: "#555" }}>
                  {room.peer.introduce}
                </div>
              )}
              <img src={room.peer.typeImageUrl} alt="type1" width={50} />
              <img src={room.peer.typeImageUrl2} alt="type2" width={50} />
              <div style={{ fontSize: "0.8rem", color: "#888" }}>
                매칭시각: {new Date(room.matchedAt).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
