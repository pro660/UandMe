// src/jsx/common/PageFade.jsx
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

export default function PageFade({ children, bg = "var(--page-bg, #fff)" }) {
  const location = useLocation();

  const variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.18 } },
    exit:    { opacity: 0, transition: { duration: 0.18 } }, // 동시 크로스페이드
  };

  return (
    <AnimatePresence mode="sync" initial={false}>
      <motion.div
        key={location.key || location.pathname}   // 동일 경로 재방문도 전환
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{
          position: "absolute",
          inset: 0,
          background: bg,         // ✅ 배경 고정 (하얀 번쩍 방지)
          willChange: "opacity",
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
