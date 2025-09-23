import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import "../../css/ranking/Ranking.css";
import King from "../../image/ranking/king.svg";

/** 공통 매핑: 학과 */
function mapDeptRanking(apiItems = []) {
  return apiItems.slice(0, 10).map((it) => ({
    id: it.rank ?? it.department ?? Math.random(),
    deptName: it.department ?? "-",
    count: it.count ?? 0,
    imageUrl: it.imageUrl ?? "",
    rank: it.rank ?? null,
    _kind: "dept",
  }));
}

/** 공통 매핑: MBTI */
function mapMbtiRanking(apiItems = []) {
  return apiItems.slice(0, 10).map((it) => ({
    id: it.rank ?? it.mbti ?? Math.random(),
    deptName: it.mbti ?? "-", // UI 공통 필드 사용
    count: it.count ?? 0,
    imageUrl: it.imageUrl ?? "",
    rank: it.rank ?? null,
    _kind: "mbti",
  }));
}

export default function Ranking({ mode = "dept", onClickTopRight }) {
  const [activeTab, setActiveTab] = useState("flirt"); // 'flirt' | 'match'
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  // mode + tab 조합으로 엔드포인트 선택
  const path =
    mode === "dept"
      ? activeTab === "flirt"
        ? "/stats/rank/department-signals"
        : "/stats/rank/department-matches"
      : activeTab === "flirt"
      ? "/stats/rank/mbti-signals"
      : "/stats/rank/mbti-matches";

  const topRightLabel = mode === "dept" ? "MBTI 랭킹보기" : "학과 랭킹보기";

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setErrMsg("");
      setItems([]);

      try {
        const res = await api.get(path, {
          signal: controller.signal,
          noAuth: true,
        });
        const arr = Array.isArray(res.data) ? res.data : [];
        const mapped = mode === "dept" ? mapDeptRanking(arr) : mapMbtiRanking(arr);
        setItems(mapped);
      } catch (e) {
        if (!controller.signal.aborted) {
          const msg =
            e?.response?.data?.message ||
            e?.message ||
            "데이터를 불러오는 중 문제가 발생했어요.";
          setErrMsg(msg);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [mode, activeTab, path]);

  // 상단 1~3위, 하단 4~10위
  const { top3, tail } = useMemo(() => {
    const sorted = [...items].sort((a, b) => {
      if (a.rank != null && b.rank != null) return a.rank - b.rank;
      return b.count - a.count;
    });
    return { top3: sorted.slice(0, 3), tail: sorted.slice(3, 10) };
  }, [items]);

  const fade = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.25 } },
  };

  return (
    <div className="rank-root" role="main">
      {/* ===== 상단: 히어로 & 시상대 ===== */}
      <section className="rank-hero">
        <div className="ellipse-small" aria-hidden="true"></div>
        <div className="rank-hero-head">
          <button
            className="rank-top-btn"
            onClick={onClickTopRight}
            aria-label={topRightLabel}
          >
            {topRightLabel}
          </button>
        </div>

        {/* 1,2,3등 프로필 (fade 애니메이션) */}
        <AnimatePresence mode="wait">
          <motion.div
            className="podium-heads"
            aria-label="상위 3위"
            key={`${mode}-${activeTab}-top3`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.35 } }}
            exit={{ opacity: 0, transition: { duration: 0.25 } }}
          >
            {top3[1] && <PodiumHead rank={2} item={top3[1]} />}
            {top3[0] && <PodiumHead rank={1} item={top3[0]} highlight />}
            {top3[2] && <PodiumHead rank={3} item={top3[2]} />}
          </motion.div>
        </AnimatePresence>

        {/* 시상대 */}
        <div className="podium">
          <div className="podium-col second" aria-hidden="true">
            <div className="podium-top top-second"></div>
            <div className="podium-front">
              <span className="podium-rank">2</span>
            </div>
          </div>
          <div className="podium-col first" aria-hidden="true">
            <div className="podium-top top-first"></div>
            <div className="podium-front">
              <span className="podium-rank">1</span>
            </div>
          </div>
          <div className="podium-col third" aria-hidden="true">
            <div className="podium-top top-third"></div>
            <div className="podium-front">
              <span className="podium-rank">3</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 하단: 탭 + 랭킹 리스트 ===== */}
      <AnimatePresence mode="wait">
        <motion.section
          key={`${mode}-${activeTab}`} 
          className="rank-list-wrap"
          {...fade}
        >
          {/* 언더라인 탭 */}
          <div
            className={`rank-tabs tabs-underline ${
              activeTab === "match" ? "is-match" : "is-flirt"
            }`}
            role="tablist"
            aria-label="랭킹 기준"
          >
            <button
              className={`tab ${activeTab === "flirt" ? "is-active" : ""}`}
              onClick={() => setActiveTab("flirt")}
              role="tab"
              aria-selected={activeTab === "flirt"}
            >
              받은 플러팅
            </button>
            <button
              className={`tab ${activeTab === "match" ? "is-active" : ""}`}
              onClick={() => setActiveTab("match")}
              role="tab"
              aria-selected={activeTab === "match"}
            >
              성사된 매칭
            </button>
            <span className="tab-ink" aria-hidden="true" />
          </div>

          {/* 로딩 / 에러 / 빈 상태 */}
          {loading && (
            <ol className="rank-list" aria-live="polite" aria-busy="true">
              {Array.from({ length: 7 }).map((_, i) => (
                <li key={i} className="rank-row" style={{ opacity: 0.6 }}>
                  <div className="rr-left">
                    <span className="rr-rank">-</span>
                    <div className="rr-thumb" />
                    <div className="rr-info">
                      <div className="rr-dept">로딩 중...</div>
                      <div className="rr-meta">잠시만 기다려주세요</div>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}

          {!loading && errMsg && (
            <div role="alert" style={{ textAlign: "center", padding: "12px 0" }}>
              {errMsg}
            </div>
          )}

          {!loading && !errMsg && items.length === 0 && (
            <div style={{ textAlign: "center", padding: "12px 0" }}>
              데이터가 없습니다.
            </div>
          )}

          {!loading && !errMsg && items.length > 0 && (
            <ol className="rank-list" start={4} aria-label="4위부터 10위">
              {tail.map((item, idx) => (
                <RankRow
                  key={item.id}
                  rank={idx + 4}
                  item={item}
                  metricLabel={activeTab === "flirt" ? "플러팅" : "매칭"}
                />
              ))}
            </ol>
          )}
        </motion.section>
      </AnimatePresence>
    </div>
  );
}

/* ===== 상단 프로필 ===== */
function PodiumHead({ rank, item, highlight = false }) {
  const hasImg = !!item.imageUrl;
  return (
    <div className={`podium-head rank-${rank} ${highlight ? "highlight" : ""}`}>
      <div className="ph-img-wrap">
        {rank === 1 && <img src={King} alt="왕관" className="ph-king" />}
        <div className="ph-img" aria-hidden={!hasImg}>
          {hasImg ? (
            <img src={item.imageUrl} alt={`${rank}위 ${item.deptName}`} />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: 14,
                color: "#7a1b60",
                background: "#fff",
              }}
              aria-label={`${rank}위 ${item.deptName}`}
              title={item.deptName}
            >
              {item.deptName}
            </div>
          )}
        </div>
      </div>

      <div className="ph-text">
        <div className="ph-dept" title={item.deptName}>
          {item.deptName}
        </div>
        <div className="ph-count">
          총 <strong>{item.count}회</strong>
        </div>
      </div>
    </div>
  );
}

/* ===== 하단 랭킹 행 ===== */
function RankRow({ rank, item, metricLabel }) {
  const hasImg = !!item.imageUrl;
  return (
    <li className="rank-row">
      <div className="rr-left">
        <span className="rr-rank">{rank}</span>
        <div className="rr-thumb">
          {hasImg ? (
            <img src={item.imageUrl} alt={`${item.deptName} 로고`} />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: 12,
                color: "#7a1b60",
                background: "#fff",
              }}
              aria-label={item.deptName}
              title={item.deptName}
            >
              {item.deptName}
            </div>
          )}
        </div>
        <div className="rr-info">
          <div className="rr-dept" title={item.deptName}>
            {item.deptName}
          </div>
          <div className="rr-meta">
            총 {item.count} {metricLabel}
          </div>
        </div>
      </div>
    </li>
  );
}