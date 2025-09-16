// src/jsx/chat/ChatList.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "../../api/userStore";
import useChatStore from "../../api/chatStore";
import api from "../../api/axios"; // ✅ axios 인스턴스

export default function ChatList() {
  const user = useUserStore((s) => s.user); // 로그인 유저
  const { rooms, setRooms } = useChatStore();
  const navigate = useNavigate();

  // 채팅방 목록 불러오기
  useEffect(() => {
    if (!user) return;

    const fetchRooms = async () => {
      try {
        const resp = await api.get("/chat/rooms", {
          headers: { Authorization: `Bearer ${user.accessToken}` }, // 토큰 포함
        });
        setRooms(resp.data); // [{ roomId, participants, lastMessage }]
      } catch (err) {
        console.error("❌ 채팅방 목록 불러오기 실패", err);
      }
    };

    fetchRooms();
  }, [user, setRooms]);

  return (
    <div className="chat-list">
      <h2>내 채팅방</h2>
      {rooms.length === 0 ? (
        <p>참여 중인 채팅방이 없습니다.</p>
      ) : (
        <ul>
          {rooms.map((room) => {
            // 내 ID 제외한 나머지 참가자 이름만 표시
            const otherUsers = room.participants.filter((p) => p !== user?.id);

            return (
              <li
                key={room.roomId}
                onClick={() => navigate(`/chat/${room.roomId}`)}
                style={{
                  cursor: "pointer",
                  padding: "10px 0",
                  borderBottom: "1px solid #ddd",
                }}
              >
                <div>
                  <b>{otherUsers.join(", ")}</b>
                </div>
                {room.lastMessage && (
                  <div style={{ fontSize: "0.9rem", color: "#555" }}>
                    최근: {room.lastMessage}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
