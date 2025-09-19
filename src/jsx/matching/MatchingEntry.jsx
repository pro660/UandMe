// src/jsx/matching/MatchingEntry.jsx
import React, { useEffect, useMemo } from "react";
import useMatchingStore from "../../api/matchingStore";
import Matching from "./Matching";
import Card from "./Card";

/** matching-storage 내용 → candidates 읽기 (zustand persist/직접 저장 둘 다 커버) */
function readStoredCandidates() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("matching-storage");
    if (!raw) return [];
    const data = JSON.parse(raw);
    const state = data?.state ?? data; // persist를 썼으면 state 안에 있음
    const cands = state?.candidates;
    return Array.isArray(cands) ? cands : [];
  } catch {
    return [];
  }
}

export default function MatchingEntry() {
  const candidates = useMatchingStore((s) => s.candidates) || [];
  const setCandidates = useMatchingStore((s) => s.setCandidates);

  // 로컬스토리지에 저장된 후보 (한 번만 계산)
  const storedCandidates = useMemo(readStoredCandidates, []);
  const hasStored = storedCandidates.length > 0;
  const hasStore = candidates.length > 0;

  // 스토어가 비어있고, 로컬스토리지에 있으면 주입
  useEffect(() => {
    if (!hasStore && hasStored) {
      setCandidates?.(storedCandidates);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasStore, hasStored]);

  // 최종 분기
  if (hasStore || hasStored) {
    return <Card />;        // ✅ 후보가 있으면 카드 뷰
  }
  return <Matching />;       // ✅ 없으면 매칭 시작 뷰
}
