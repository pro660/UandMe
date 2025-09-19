// src/components/transitions/PageFade.jsx
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

export default function PageFade({ children, bg = "var(--page-bg, #fff)" }) {
  const location = useLocation();

  const variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.25 } },
    exit:    { opacity: 0, transition: { duration: 0.2 } },
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}    // 라우트 경로별로 전환
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{
          position: "absolute",
          inset: 0,
          background: bg,          // 번쩍임 방지용 배경
          willChange: "opacity",
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
