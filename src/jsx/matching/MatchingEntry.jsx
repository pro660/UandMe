import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import api from "../../api/axios";
import Matching from "./Matching";
import Card from "./Card";
import Nohuman from "./Nohuman"; // ✅ 추가

const normalizeList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.candidates)) return data.candidates;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.35 } },
  exit: { opacity: 0, transition: { duration: 0.35 } },
};

export default function MatchingEntry() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [initialList, setInitialList] = useState([]);

  // ✅ API 호출
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const resp = await api.get("/match/previous");
        if (!alive) return;
        setInitialList(normalizeList(resp?.data));
      } catch (e) {
        if (!alive) return;
        console.error("❌ 이전 매칭 불러오기 실패:", e);
        setErr(e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // ✅ 에러 처리
  if (err) {
    const msg = err?.response?.data?.message || err.message;
    return (
      <div style={{ padding: "1.6rem", color: "#ff4d4f" }}>
        문제 발생: {msg}
      </div>
    );
  }

  return (
    <AnimatePresence mode="sync">
      {!loading && (
        <motion.div
          key={
            initialList.length > 0
              ? "card"
              : "nohuman" // ✅ 빈 배열이면 Nohuman 표시
          }
          {...fade}
        >
          {initialList.length > 0 ? (
            <Card initialCandidates={initialList} />
          ) : (
            <Nohuman />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
