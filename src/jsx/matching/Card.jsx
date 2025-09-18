import React, { useRef, useState, useCallback } from "react";
import "../../css/matching/Card.css";

const cards = [
  { id: 1, name: "정민",   major: "항공소프트웨어공학과", message: "반갑습니다", img: "/images/panda.png" },
  { id: 2, name: "정재민", major: "항공소프트웨어공학과", message: "반갑습니다", img: "/images/dog.png" },
  { id: 3, name: "종민",   major: "항공소프트웨어공학과", message: "반갑습니다", img: "/images/cat.png"  },
];

export default function MatchPage() {
  // 가운데(2번째)부터 시작
  const [idx, setIdx] = useState(1);
  // 드래그 실시간 이동량(px)
  const [dx, setDx] = useState(0);
  // 스냅 중인지(transition on)
  const [snapping, setSnapping] = useState(false);

  const startX = useRef(0);
  const dragging = useRef(false);
  const lock = useRef(false);

  const prevIndex = useCallback((i) => (i - 1 + cards.length) % cards.length, []);
  const nextIndex = useCallback((i) => (i + 1) % cards.length, []);

  const spread = 144; // CSS --spread와 동일(9rem = 9*16 = 144px)
  const threshold = 48; // 넘길지 말지 기준

  const beginDrag = (clientX) => {
    if (lock.current) return;
    dragging.current = true;
    setSnapping(false);
    startX.current = clientX;
  };

  const moveDrag = (clientX) => {
    if (!dragging.current || lock.current) return;
    const delta = clientX - startX.current;
    setDx(delta);
  };

  const endDrag = () => {
    if (!dragging.current || lock.current) return;
    dragging.current = false;

    // 스냅 판정
    if (dx <= -threshold) {
      // 왼쪽으로 스와이프 → 오른쪽 카드가 앞으로 (다음 인덱스)
      lock.current = true;
      setSnapping(true);
      // 목표 위치까지 자연스럽게 이동
      setDx(-spread);
    } else if (dx >= threshold) {
      // 오른쪽으로 스와이프 → 왼쪽 카드가 앞으로 (이전 인덱스)
      lock.current = true;
      setSnapping(true);
      setDx(spread);
    } else {
      // 되돌리기
      setSnapping(true);
      setDx(0);
    }
  };

  // transition 끝나면 인덱스 갱신하고 원위치로 리셋
  const onSnapEnd = () => {
    if (!snapping) return;

    if (dx === -spread) {
      setIdx((v) => nextIndex(v));
    } else if (dx === spread) {
      setIdx((v) => prevIndex(v));
    }
    setSnapping(false);
    setDx(0);
    lock.current = false;
  };

  const getPos = (i) => {
    if (i === idx) return "center";
    if (i === prevIndex(idx)) return "left";
    if (i === nextIndex(idx)) return "right";
    return "hidden";
  };

  return (
    <div className="match-root">
      <p className="match-title">원하는 상대에게 플러팅을 하세요</p>

      <div
        className={`carousel ${snapping ? "snapping" : ""}`}
        style={{ "--dx": `${dx}px` }}
        onTransitionEnd={onSnapEnd}
        // 마우스
        onMouseDown={(e) => beginDrag(e.clientX)}
        onMouseMove={(e) => moveDrag(e.clientX)}
        onMouseUp={endDrag}
        onMouseLeave={() => {
          if (dragging.current) endDrag();
        }}
        // 터치
        onTouchStart={(e) => beginDrag(e.touches[0].clientX)}
        onTouchMove={(e) => moveDrag(e.touches[0].clientX)}
        onTouchEnd={endDrag}
      >
        {/* 데스크톱용 네비 버튼 */}
        <button
          aria-label="이전"
          className="nav-btn left"
          onClick={() => {
            if (lock.current) return;
            lock.current = true;
            setSnapping(true);
            setDx(spread);
          }}
        />
        <button
          aria-label="다음"
          className="nav-btn right"
          onClick={() => {
            if (lock.current) return;
            lock.current = true;
            setSnapping(true);
            setDx(-spread);
          }}
        />

        {cards.map((c, i) => (
          <button key={c.id} className={`match-card pos-${getPos(i)}`}>
            <div className="img-wrap">
              <img src={c.img} alt={c.name} />
            </div>
            <div className="card-info">
              <h3>{c.name}</h3>
              <p className="major">{c.major}</p>
              <p className="msg">“{c.message}”</p>
            </div>
          </button>
        ))}
      </div>

      <button className="rematch-btn">다시 매칭하기</button>
    </div>
  );
}
