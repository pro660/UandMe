import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/**
 * iOS 느낌의 전역 페이지 전환 래퍼
 * - 헤더/메뉴는 밖에 두고, 본문만 전환
 * - PUSH/POP 방향 자동감지
 * - 모바일 좌측 엣지 스와이프-백(옵션)
 */
export default function PageTransitionsIOS({
  children,
  swipeBack = true,
  edgeWidth = 16,      // 엣지 시작 감지 px
  swipeThreshold = 80, // 뒤로가기 임계 px
}) {
  const location = useLocation();
  const navigate = useNavigate();

  // 진행 방향 계산
  const idx = (window.history.state && window.history.state.idx) || 0;
  const prevIdxRef = useRef(idx);
  const direction = idx > prevIdxRef.current ? 1 : -1; // 1: push, -1: pop
  useEffect(() => { prevIdxRef.current = idx; }, [idx]);

  // iOS 감성 스프링
  const spring = { type: "spring", stiffness: 320, damping: 34, mass: 0.9 };

  // 패럴랙스 슬라이드
  const variants = {
    enter: (dir) =>
      dir === 1 ? { x: "100%", scale: 1 } : { x: "-25%", scale: 0.995 },
    center: { x: "0%", scale: 1, transition: spring },
    exit: (dir) =>
      dir === 1
        ? { x: "-25%", scale: 0.995, transition: { ...spring, damping: 28 } }
        : { x: "100%", scale: 1, transition: { ...spring, damping: 28 } },
  };

  // 모바일에서만 스와이프-백
  const isTouch = typeof window !== "undefined" && matchMedia("(pointer:coarse)").matches;
  const allowSwipe = swipeBack && isTouch && idx > 0;

  // 엣지 시작 여부
  const [edgeStart, setEdgeStart] = useState(false);
  const onPointerDown = (e) => {
    if (!allowSwipe) return setEdgeStart(false);
    const x = e.clientX ?? (e.touches && e.touches[0]?.clientX) ?? 9999;
    setEdgeStart(x <= edgeWidth);
  };
  const onDragEnd = (_e, info) => {
    if (info.offset.x > swipeThreshold) navigate(-1);
    setEdgeStart(false);
  };

  return (
    <AnimatePresence mode="sync" initial={false} custom={direction}>
      <motion.div
        key={location.pathname}
        className="ios-screen"
        custom={direction}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        style={{ position: "absolute", inset: 0, willChange: "transform, opacity" }}
        onPointerDown={onPointerDown}
        onPointerUp={() => setEdgeStart(false)}
        drag={allowSwipe ? "x" : false}
        dragListener={edgeStart}
        dragConstraints={{ left: 0, right: 320 }}
        dragElastic={0.12}
        dragMomentum={false}
        dragSnapToOrigin
        onDragEnd={onDragEnd}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
