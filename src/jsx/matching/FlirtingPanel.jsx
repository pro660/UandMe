// src/jsx/common/FlirtingPanel.jsx
import { useEffect, useState } from "react";
import api from "../../api/axios.js";
import useUserStore from "../../api/userStore.js"; // ✅ 추가
import "../../css/signup/ResultPage.css";

export default function FlirtingPanel({ targetUserId, onSent }) {
  const [alreadySent, setAlreadySent] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ zustand store
  const { user, setUser } = useUserStore();

  useEffect(() => {
    if (!targetUserId) return;

    const checkStatus = async () => {
      try {
        const resp = await api.get(`/signals/${targetUserId}/status`);
        setAlreadySent(resp.data.alreadySent === true);
      } catch (err) {
        console.error("❌ 플러팅 상태 확인 실패:", err);
      }
    };

    checkStatus();
  }, [targetUserId]);

  const handleSend = async () => {
    try {
      setLoading(true);
      await api.post(`/signals/${targetUserId}`);
      setAlreadySent(true);

      // ✅ zustand에서 차감 반영
      if (user?.signalCredits > 0) {
        setUser({
          ...user,
          signalCredits: user.signalCredits - 1,
        });
      }

      if (onSent) onSent();
    } catch (err) {
      console.error("❌ 플러팅 실패:", err);
      alert("플러팅을 보낼 수 없습니다. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flirting-panel">
      <button
        className={`flirting-cta ${alreadySent ? "done" : ""}`}
        onClick={handleSend}
        disabled={alreadySent || loading}
      >
        {alreadySent ? "플러팅 완료" : loading ? "보내는 중..." : "플러팅 하기"}
      </button>

      <div className="flirting-note">
        <p className="note-title">신호/매칭 안내</p>
        <ul className="note-list">
          <li>기본 횟수: ‘신호 보내기’ 3회, ‘매칭’ 3회</li>
          <li>추가 횟수: 부스 쿠폰 등록 시 추가 가능</li>
          <li>쿠폰 혜택: 쿠폰 등록 시 각 5회씩 추가됩니다.</li>
        </ul>
      </div>
    </div>
  );
}
