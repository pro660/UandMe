import React, { useRef, useState } from "react";
import "../../css/matching/Card.css";

const cards = [
  { id: 1, name: "정민",   major: "항공소프트웨어공학과", message: "반갑습니다", img: "/images/panda.png" },
  { id: 2, name: "정재민", major: "항공소프트웨어공학과", message: "반갑습니다", img: "/images/dog.png" },
  { id: 3, name: "종민",   major: "항공소프트웨어공학과", message: "반갑습니다", img: "/images/cat.png"  },
];

export default function MatchPage() {
  const [idx, setIdx] = useState(1);        // 가운데(2번째)부터 시작
  const [anim, setAnim] = useState(null);   // 'left' | 'right' | null (전환 연출용)
  const lockRef = useRef(false);            // 전환 중 중복 입력 방지
  const startX = useRef(0);
  const dragging = useRef(false);

  const prevIndex = (i) => (i - 1 + cards.length) % cards.length;
  const nextIndex = (i) => (i + 1) % cards.length;

  const goLeft = () => {  // 왼쪽으로 스와이프(→ 오른쪽 카드가 앞으로)
    if (lockRef.current) return;
    lockRef.current = true;
    setAnim("left");
    setTimeout(() => {
      setIdx((v) => nextIndex(v));
      setAnim(null);
      lockRef.current = false;
    }, 320);
  };

  const goRight = () => { // 오른쪽으로 스와이프(→ 왼쪽 카드가 앞으로)
    if (lockRef.current) return;
    lockRef.current = true;
    setAnim("right");
    setTimeout(() => {
      setIdx((v) => prevIndex(v));
      setAnim(null);
      lockRef.current = false;
    }, 320);
  };

  // 터치/드래그
  const onTouchStart = (e) => {
    dragging.current = true;
    startX.current = e.touches ? e.touches[0].clientX : e.clientX;
  };
  const onTouchMove = (e) => {
    if (!dragging.current) return;
  };
  const onTouchEnd = (e) => {
    if (!dragging.current) return;
    dragging.current = false;
    const endX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const delta = endX - startX.current;
    const threshold = 40; // 민감도
    if (delta < -threshold) goLeft();
    else if (delta > threshold) goRight();
  };

  // 현재 인덱스 기준 포지션 클래스 계산
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
        className={`carousel ${anim ? `swipe-${anim}` : ""}`}
        onMouseDown={onTouchStart}
        onMouseUp={onTouchEnd}
        onMouseLeave={() => (dragging.current = false)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* 좌우 화살표 (데스크톱용) */}
        <button aria-label="이전" className="nav-btn left" onClick={goRight} />
        <button aria-label="다음" className="nav-btn right" onClick={goLeft} />

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
