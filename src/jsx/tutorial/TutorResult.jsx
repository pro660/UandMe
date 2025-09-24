import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../../css/tutorial/TutorResult.css";
import CardImg from "../../image/tutorial/card.svg";

export default function TutorResult() {
  // 튜토리얼 말풍선(모달) 표시 여부
  const [showHint, setShowHint] = useState(true);
  const navigate = useNavigate();

  return (
    <div className="tres-page" role="main" aria-label="튜토리얼 결과 화면">
      {/* 말풍선 */}
      <div className="tres-bubble" role="status" aria-live="polite">
        <span className="tres-bubble-text">반갑습니다.</span>
        <span className="tres-bubble-caret" aria-hidden="true" />
      </div>

      {/* 카드 이미지 (SVG) */}
      <img
        src={CardImg}
        alt="튜토리얼 프로필 카드"
        className="tres-card-img"
        draggable={false}
      />

      {/* 아래 큰 흰색 곡면 (장식) */}
      <div className="tres-curve" aria-hidden="true" />

      {/* ===== 튜토리얼 딤 & 말풍선 모달 ===== */}
      {showHint && (
        <>
          {/* 화면 전체 회색 딤(버튼/말풍선만 위로) */}
          <div className="tres-modal-dim" aria-hidden="true" />

          {/* 버튼 위 말풍선 모달 */}
          <div className="tres-hint-wrap" role="dialog" aria-label="튜토리얼 안내">
            <div className="tres-hint">
              <span className="tres-hint-caret" aria-hidden="true" />
              <p className="tres-hint-text">
                원하는 이성에게 <b>'플러팅하기'</b>를 실행하면, 해당 이성의 프로필에 플러팅이 표시됩니다.
              </p>
              <div className="tres-hint-footer">
                <button
                  type="button"
                  className="tres-hint-close"
                  onClick={() => {
                    setShowHint(false);
                    navigate("/tutorial/5"); // ✅ 경로 오타 수정
                  }}  
                >
                  다음
                </button>
                <p className="tres-step">3/8</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* CTA 버튼 (딤 위 레이어로 올림) */}
      <div className={`tres-cta-wrap ${showHint ? "tres-tutorial-alive" : ""}`}
      aria-hidden="true">
        <div className="tres-cta-btn">플러팅 하기</div>
      </div>

      {/* 안내 박스 */}
      <section className="tres-note" aria-label="신호 및 매칭 안내">
        <h3 className="tres-note-title">신호/매칭 횟수 및 연장 방법</h3>
        <p className="tres-note-text">
          <b>기본 횟수</b>: ‘신호 보내기’ 3회, ‘매칭 횟수’ 3회로 제한합니다.
        </p>
        <p className="tres-note-text">
          <b>추가 횟수</b>: 축제 운영 부스의 ‘뱃지/사다리’ 스테이션 등에서 룰렛 구매 시
          랜덤한 추첨으로 추가 기회를 얻을 수 있어요!
        </p>
        <p className="tres-note-text">
          <b>보너스</b>: 퀘스트를 수행하면 ‘신호 보내기’ 및 ‘매칭 횟수’가 각 5회씩 추가됩니다.
        </p>
      </section>

      {/* 연애 유형 */}
      <section className="tres-type" aria-label="연애 유형">
        <p className="tres-type-lead">김멋사님의 연애 유형은…</p>
        <p className="tres-type-name">세련된 감각형 입니다.</p>
        <p className="tres-type-desc">만남을 빛내는 개성 넘치는 매력의 소유자!</p>
      </section>
    </div>
  );
}
