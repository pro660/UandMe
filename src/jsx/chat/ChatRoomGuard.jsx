// ChatRoomGuard.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../libs/firebase";
import useUserStore from "../../api/userStore";

export default function ChatRoomGuard({ children }) {
  const { roomId } = useParams();
  const { user } = useUserStore(); // 여기 user.userId는 JWT 기반
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState(null);

  useEffect(() => {
    async function checkAccess() {
      const ref = doc(db, "chatRooms", roomId);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        if (data.participants.includes(String(user.userId))) {
          setAllowed(true);
        } else {
          setAllowed(false);
          alert("접근 권한이 없는 채팅방입니다.");
          navigate("/chat"); // 채팅 리스트로 이동
        }
      } else {
        setAllowed(false);
        alert("존재하지 않는 채팅방입니다.");
        navigate("/chat");
      }
    }

    if (roomId && user?.userId) {
      checkAccess();
    }
  }, [roomId, user?.userId, navigate]);

  if (allowed === null) return <div>로딩중...</div>;
  if (!allowed) return null;

  return children;
}
