import React, { useMemo, useState, useEffect, useContext } from "react";
import {
  useNavigate,
  useLocation,
  UNSAFE_NavigationContext,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion"; // ✅ 추가

import api from "../../api/axios.js";
import useUserStore from "../../api/userStore.js";
import Loader from "../common/Loader.jsx";
import "../../css/signup/QPage.css";
import bigheartImg from "../../image/loginPage/bigheart.svg";

/** 기본 문항 */
const DEFAULT_QUESTIONS = [
  /* ... 생략 (동일) ... */
];

/* 이동 차단 Hook */
function useBlocker(blocker, when = true) {
  const { navigator } = useContext(UNSAFE_NavigationContext);
  useEffect(() => {
    if (!when) return;
    const push = navigator.push;
    const replace = navigator.replace;
    navigator.push = (...args) => {
      const tx = { action: "push", args, retry: () => push(...args) };
      if (blocker(tx)) return;
      push(...args);
    };
    navigator.replace = (...args) => {
      const tx = { action: "replace", args, retry: () => replace(...args) };
      if (blocker(tx)) return;
      replace(...args);
    };
    return () => {
      navigator.push = push;
      navigator.replace = replace;
    };
  }, [navigator, blocker, when]);
}

/* 게이트: baseInfo 확인 */
export default function QPage({ questions = DEFAULT_QUESTIONS }) {
  const navigate = useNavigate();
  const location = useLocation();
  const baseInfo = location.state?.baseInfo;
  useEffect(() => {
    if (!baseInfo) {
      navigate("/infoform", { replace: true });
    }
  }, [baseInfo, navigate]);
  if (!baseInfo) return null;
  return <QPageInner questions={questions} baseInfo={baseInfo} />;
}

/* 실제 페이지 */
function QPageInner({ questions, baseInfo }) {
  const navigate = useNavigate();

  const TOTAL = questions.length;
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(Array(TOTAL).fill(null));
  const [choice, setChoice] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [pendingTx, setPendingTx] = useState(null);

  const q = questions[step];
  const displayNo = useMemo(() => String(step + 1).padStart(2, "0"), [step]);

  // 새로고침 방지
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (step < TOTAL && step >= 0 && !submitting) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [step, TOTAL, submitting]);

  // 내부 라우터 이동 방지
  useBlocker((tx) => {
    if (step < TOTAL && step >= 0 && !submitting) {
      setShowLeaveModal(true);
      setPendingTx(tx);
      return true;
    }
    return false;
  }, true);

  const confirmLeave = () => {
    if (pendingTx) {
      setShowLeaveModal(false);
      const retry = pendingTx.retry;
      setPendingTx(null);
      retry();
    }
  };
  const cancelLeave = () => {
    setShowLeaveModal(false);
    setPendingTx(null);
  };

  // 진행/제출
  const handleConfirm = async () => {
    if (choice === null) return;
    const next = answers.slice();
    next[step] = choice;
    setAnswers(next);
    if (step < TOTAL - 1) {
      setStep((s) => s + 1);
      setChoice(next[step + 1] ?? null);
      return;
    }
    try {
      setSubmitting(true);
      const ab = next.map((v) => (v === 0 ? "a" : "b"));
      const qPayload = {
        q1: ab[0],
        q2: ab[1],
        q3: ab[2],
        q4: ab[3],
        q5: ab[4],
        q6: ab[5],
        q7: ab[6],
        q8: ab[7],
        q9: ab[8],
        q10: ab[9],
      };
      const payload = { ...baseInfo, ...qPayload };
      await api.put("/users/me/profile", payload);
      const resp = await api.get("/users/me/profile");
      const profileData = resp.data;
      const prev = useUserStore.getState().user || {};
      useUserStore.getState().setUser({ ...prev, ...profileData });
      const scoreA = ab.filter((c) => c === "a").length;
      const scoreB = ab.filter((c) => c === "b").length;
      const dominant =
        scoreA === scoreB ? "BALANCED" : scoreA > scoreB ? "A-TYPE" : "B-TYPE";
      sessionStorage.setItem("q_answers", JSON.stringify(ab));
      sessionStorage.setItem("q_profile", JSON.stringify(profileData));
      sessionStorage.setItem("q_scoreA", String(scoreA));
      sessionStorage.setItem("q_scoreB", String(scoreB));
      sessionStorage.setItem("q_dominant", dominant);
      navigate("/result", {
        replace: true,
        state: { profile: profileData, answers: ab, scoreA, scoreB, dominant },
      });
    } catch (e) {
      console.error(e);
      alert("프로필 저장 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (step === 0) {
      setShowLeaveModal(true);
    } else {
      setStep((s) => s - 1);
      setChoice(answers[step - 1]);
    }
  };

  if (!q)
    return <div className="qpage-error">문항 데이터를 불러오지 못했어요.</div>;

  return (
    <div className="qpage">
      {submitting && <Loader />}

      {/* 상단 */}
      <div className="qpage-top">
        <button className="qpage-back" onClick={handleBack} type="button">
          ←
        </button>
        <div
          className="qpage-progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={TOTAL}
          aria-valuenow={step + 1}
        >
          <div
            className="qpage-progress-fill"
            style={{ width: `${((step + 1) / TOTAL) * 100}%` }}
          />
        </div>
      </div>

      {/* 하트 + 번호 */}
      <div className="qpage-heart">
        <span className="qpage-heart-icon" aria-hidden>
          <img src={bigheartImg} alt="하트 이미지" />
        </span>
        <span className="qpage-heart-no">{displayNo}</span>
      </div>

      {/* ✅ 질문 + 선택지에 페이드 애니메이션 적용 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.25 } }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
        >
          <div className="qpage-card">
            <p className="qpage-question">{q.text}</p>
          </div>
          <div className="qpage-options">
            {q.options.map((opt, idx) => (
              <button
                key={idx}
                className={`qpage-option ${choice === idx ? "active" : ""}`}
                onClick={() => setChoice(idx)}
                type="button"
              >
                {opt}
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* 확인 버튼 */}
      <button
        className="qpage-confirm"
        onClick={handleConfirm}
        disabled={choice === null || submitting}
        type="button"
      >
        {step === TOTAL - 1
          ? submitting
            ? "제출 중..."
            : "결과 보기"
          : "확인"}
      </button>

      {/* 이탈 경고 모달 */}
      {showLeaveModal && (
        <div className="leave-modal">
          <div className="leave-modal-content">
            <p>
              진행상황이 사라질 수 있습니다.
              <br />
              정말 나가시겠습니까?
            </p>
            <div className="leave-modal-actions">
              <button onClick={cancelLeave} type="button">
                취소
              </button>
              <button onClick={confirmLeave} type="button">
                나가기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
