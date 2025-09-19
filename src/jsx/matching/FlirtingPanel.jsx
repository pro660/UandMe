// src/jsx/common/FlirtingPanel.jsx
import { useEffect, useState } from "react";
import api from "../../api/axios.js";
import "../../css/signup/ResultPage.css"; // 스타일은 기존 CSS 재활용

export default function FlirtingPanel({ targetUserId, onSent }) {
  const [alreadySent, setAlreadySent] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ 모달 열릴 때 상태 확인
  useEffect(() => {
    if (!targetUserId) return;

    const checkStatus = async () => {
      try {
        const resp = await api.get(`/signals/${targetUserId}/status`);
        // 서버 응답: { alreadySent: true/false }
        setAlreadySent(resp.data.alreadySent === true);
      } catch (err) {
        console.error("❌ 플러팅 상태 확인 실패:", err);
      }
    };

    checkStatus();
  }, [targetUserId]);

  // ✅ 플러팅 보내기
  const handleSend = async () => {
    try {
      setLoading(true);
      await api.post(`/signals/${targetUserId}`);
      setAlreadySent(true); // 바로 상태 반영
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
          <li>쿠폰 혜택: 쿠폰 등록 시 '신호 보내기' 및 '매칭 횟수'가 각 5회씩 추가됩니다.</li>
        </ul>
      </div>
    </div>
  );
}
