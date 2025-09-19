import React, { useState } from "react";
import api from "../../api/axios";

/** 프로필카드 아래에 표시되는 플러팅 CTA + 안내 박스 */
export default function FlirtingPanel({ targetUserId, onSent }) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleFlirt = async () => {
    if (!targetUserId || loading || sent) return;
    setLoading(true);
    try {
      await api.post(`/signals/${targetUserId}`);
      setSent(true);
      onSent?.();
    } catch (e) {
      console.error(e);
      alert("플러팅 전송에 실패했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flirting-panel">
      <button
        className={`flirting-cta ${sent ? "done" : ""}`}
        onClick={handleFlirt}
        disabled={loading || sent}
        type="button"
        aria-label="플러팅 보내기"
      >
        {sent ? "플러팅 완료!" : loading ? "전송 중..." : "플러팅 하기"}
      </button>

      <div className="flirting-note">
        <div className="note-title">신호/매칭 횟수 및 연장 방법</div>
        <ul className="note-list">
          <li>기본 횟수: ‘신호 보내기’ 3회, ‘매칭 횟수’ 3회로 제한됩니다.</li>
          <li>추가 횟수: 축제 중 ‘멋쟁이 사자처럼’ 부스 음료 구매 시 쿠폰으로 추가 기회를 얻을 수 있어요.</li>
          <li>쿠폰 혜택: 쿠폰 등록 시 ‘신호 보내기’ 및 ‘매칭 횟수’가 각 5회씩 추가됩니다.</li>
        </ul>
      </div>
    </div>
  );
}
