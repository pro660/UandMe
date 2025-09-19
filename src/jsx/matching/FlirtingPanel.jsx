// src/jsx/common/FlirtingPanel.jsx
import { useEffect, useState } from "react";
import api from "../../api/axios.js";
import useUserStore from "../../api/userStore.js";
import "../../css/signup/ResultPage.css";

export default function FlirtingPanel({ targetUserId, onSent }) {
  const [alreadySent, setAlreadySent] = useState(false);
  const [loading, setLoading] = useState(false);

  // zustand store
  const { user, setUser } = useUserStore();

  useEffect(() => {
    if (!targetUserId) return;

    let alive = true;
    (async () => {
      try {
        const resp = await api.get(`/signals/${targetUserId}/status`);
        if (!alive) return;
        setAlreadySent(resp?.data?.alreadySent === true);
      } catch (err) {
        console.error("❌ 플러팅 상태 확인 실패:", err);
      }
    })();

    return () => {
      alive = false;
    };
  }, [targetUserId]);

  const handleSend = async () => {
    if (!targetUserId || alreadySent || loading) return;

    const credits = user?.signalCredits ?? 0;
    if (credits <= 0) {
      alert("신호 기회가 없습니다! 부스 쿠폰 등록 시 추가됩니다.");
      return;
    }

    // ✅ 확인창: '확인'일 때만 진행
    const ok = window.confirm(
      "플러팅을 보내시겠습니까?\n신호 1회가 차감됩니다."
    );
    if (!ok) return;

    try {
      setLoading(true);

      await api.post(`/signals/${targetUserId}`);

      // 서버 성공 시 로컬 상태 업데이트
      setAlreadySent(true);
      setUser((prev) => ({
        ...prev,
        signalCredits: Math.max(0, (prev?.signalCredits ?? 0) - 1),
      }));

      alert("플러팅을 보냈습니다!");
      if (onSent) onSent();
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message;

      // 서버에서 이미 보낸 상대라고 응답한 경우
      if (status === 409 || /already/i.test(msg ?? "")) {
        setAlreadySent(true);
        alert("이미 이 상대에게 플러팅을 보냈어요.");
      } else {
        console.error("❌ 플러팅 실패:", err);
        alert(msg || "플러팅을 보낼 수 없습니다. 다시 시도해 주세요.");
      }
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
