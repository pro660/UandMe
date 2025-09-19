// src/jsx/matching/MatchingEntry.jsx
import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import Matching from "./Matching";
import Card from "./Card";

const normalizeList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.candidates)) return data.candidates;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

export default function MatchingEntry() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [initialList, setInitialList] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const resp = await api.get("/match/previous");
        const list = normalizeList(resp?.data);
        if (!alive) return;
        setInitialList(list);
      } catch (e) {
        if (!alive) return;
        console.error("❌ 이전 매칭 불러오기 실패:", e);
        setErr(e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (loading) return <div style={{ padding: "1.6rem", textAlign: "center" }}>불러오는 중…</div>;
  if (err) {
    const msg = err?.response?.data?.message || err.message;
    return <div style={{ padding: "1.6rem", color: "#ff4d4f" }}>문제 발생: {msg}</div>;
  }

  return initialList.length > 0
    ? <Card initialCandidates={initialList} />
    : <Matching />;
}
