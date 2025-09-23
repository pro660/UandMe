// src/jsx/matching/Matching.jsx
import React from "react";
import { useNavigate } from "react-router-dom";   // ✅ 네비게이션 훅 추가
import "../../css/tutorial/TutorMatching.css";

import starImg from "../../image/matching/star.svg";
import unKnownImg from "../../image/matching/unknown.svg";

const FIXED_STARS = [
  { id: 0, left: 26, top: 10, size: 100, rot: 0, op: 0.55 },
  { id: 1, left: 10, top: 50, size: 80, rot: 0, op: 0.5 },
  { id: 2, left: 88, top: 37, size: 110, rot: 0, op: 0.6 },
];

export default function TutorMatching() {
  const navigate = useNavigate();   // ✅ 라우터 네비게이트 훅

  const handleNext = () => {
    navigate("/tutorial/result");   // ✅ 원하는 경로로 이동
  };

  const CardBodyDemo = ({ name, department, introduce }) => (
    <>
      <div className="tur-matching-card-stars" aria-hidden="true">
        {FIXED_STARS.map((s) => (
          <img
            key={s.id}
            src={starImg}
            alt=""
            className="tur-matching-star"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              opacity: s.op,
              transform: `translate(-50%, -50%) rotate(${s.rot}deg)`,
            }}
          />
        ))}
      </div>
      <div className="tur-matching-img-frame">
        <img src={unKnownImg} alt="unknown" draggable={false} />
      </div>
      <div className="tur-matching-arch" aria-hidden={false}>
        <div className="tur-matching-arch-content">
          <p className="tur-matching-name">{name}</p>
          <p className="tur-matching-major">{department}</p>
          <p className="tur-matching-msg">“{introduce}”</p>
        </div>
      </div>
    </>
  );

  return (
    <div className="tur-matching-page tur-matching-scope">
      <div className="tur-matching-title">매칭 버튼을 누르세요</div>

      <div className="tur-matching-card-root">
        <div className="tur-matching-card-wrap">
          {/* 가운데 카드 */}
          <div className="tur-matching-slot" style={{ transform: "translate(-50%,-50%)" }}>
            <div className="tur-matching-card">
              <CardBodyDemo name="???" department="?????????" introduce="???" />
            </div>
          </div>

          {/* 왼쪽 카드 */}
          <div
            className="tur-matching-slot"
            style={{ transform: "translate(calc(-50% - 15rem), -50%)" }}
          >
            <div className="tur-matching-card">
              <CardBodyDemo name="???" department="?????????" introduce="???" />
            </div>
          </div>

          {/* 오른쪽 카드 */}
          <div
            className="tur-matching-slot"
            style={{ transform: "translate(calc(-50% + 15rem), -50%)" }}
          >
            <div className="tur-matching-card">
              <CardBodyDemo name="???" department="?????????" introduce="???" />
            </div>
          </div>
        </div>

        {/* ✅ 버튼 위 설명 말풍선 박스 (tur- prefix) */}
        <div
          className="tur-matching-hint-wrap"
          role="note"
          aria-live="polite"
          aria-label="튜토리얼 안내"
        >
          <div className="tur-matching-hint">
            <span className="tur-matching-hint-caret" aria-hidden="true" />
            <p className="tur-matching-hint-text">
              <b>매칭</b> 버튼을 누르면, <span className="tur-matching-hint-em">3명의 이성 프로필</span>이
              표시됩니다.
            </p>

            {/* 하단 푸터 (다음 버튼/스텝) */}
            <div className="tur-matching-hint-footer">
              <button
                type="button"
                className="tur-matching-hint-next"
                onClick={handleNext}   // ✅ 다음 페이지 이동
              >
                다음
              </button>
              <span className="tur-matching-hint-step">2/8</span>
            </div>
          </div>
        </div>

        {/* ✅ 매칭하기 버튼 (tur- prefix) */}
        <div className="tur-matching-cta-wrap tur-matching-tutorial-alive">
          <button type="button" className="tur-matching-cta-btn">
            매칭하기
          </button>
        </div>
      </div>

      {/* ✅ 화면 전체 회색 딤 + 클릭 차단 (tur- prefix) */}
      <div className="tur-matching-modal-dim" aria-hidden="true" />
      <div className="tur-matching-click-blocker" aria-hidden="true" />
    </div>
  );
}
