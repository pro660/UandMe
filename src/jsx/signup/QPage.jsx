// src/pages/QPage.jsx
import React, { useMemo, useState, useEffect, useContext } from "react";
import { useNavigate, UNSAFE_NavigationContext } from "react-router-dom";

import api from "../../api/axios.js";
import useUserStore from "../../api/userStore.js";
import Loader from "../common/Loader.jsx"; // ✅ 추가
import "../../css/signup/QPage.css";
import bigheartImg from "../../image/loginPage/bigheart.svg";

/** 기본 문항 */
const DEFAULT_QUESTIONS = [
  {
    id: 1,
    text: "첫만남에서의 당신, 주로 어떤 상황을 선호하시나요?",
    options: [
      "사람들과 함께하는 편안하고 시끌벅적한 모임",
      "조용하고 분위기 있는 카페에서 일대일 대화",
    ],
  },
  {
    id: 2,
    text: "데이트 상대를 볼 때, 가장 중요하게 생각하는 것은?",
    options: [
      "유머러스하고 즐거운 시간을 보내 수 있는 사람",
      "진지하고 깊이 있는 대화를 나눌 수 있는 사람",
    ],
  },
  {
    id: 3,
    text: "첫 인사할 때, 어떤 모습일까요?",
    options: ["조심스럽게 인사하기", "눈 마주치며 당당하게 인사하기"],
  },
  {
    id: 4,
    text: "갈등 상황에서 당신은?",
    options: [
      "회피하기보단 직접적으로 소통하고 해결하려한다.",
      "상대의 의견을 먼저 듣고 배려하며 부드럽게 대처한다.",
    ],
  },
  {
    id: 5,
    text: "당신의 외적 이상형에 더 가까운 것은?",
    options: ["힙하고 트렌디한 스타일", "깔끔하고 단정한 스타일"],
  },
  {
    id: 6,
    text: "어떤 데이트를 선호하나요?",
    options: ["즉흥적이고 계획되지 않은 데이트", "미리 준비한 안정적인 데이트"],
  },
  {
    id: 7,
    text: "애정 표현 방식은 주로 어떤가요?",
    options: ["솔직하고 직접적", "은은하고 섬세함"],
  },
  {
    id: 8,
    text: "관계에서 당신이 추구하는 가장 큰 가치는 무엇인가요?",
    options: [
      "서로에게 새로운 활력을 불어넣는 흥미로움",
      "편안한 신뢰를 바탕으로 한 안정감",
    ],
  },
  {
    id: 9,
    text: "호감이 있는 사람이랑 데이트 중 손이 닿았을 때, 어떻게 할건가요?",
    options: ["자연스럽게 손 잡기", "작게 웃으며 눈치만 보기"],
  },
  {
    id: 10,
    text: "데이트 상대와 있을 때, 당신의 모습은?",
    options: [
      "재미있는 분위기를 주도하고 리드하는 편",
      "상대방의 이야기에 귀 기울이고 맞춰주는 편",
    ],
  },
];

/* ---------------------------------
   ✅ react-router v6 이동 차단 Hook (tx.retry 지원)
-----------------------------------*/
function useBlocker(blocker, when = true) {
  const { navigator } = useContext(UNSAFE_NavigationContext);

  useEffect(() => {
    if (!when) return;

    const push = navigator.push;
    const replace = navigator.replace;

    navigator.push = (...args) => {
      const tx = { action: "push", args, retry: () => push(...args) };
      if (blocker(tx)) return; // 차단
      push(...args);
    };

    navigator.replace = (...args) => {
      const tx = { action: "replace", args, retry: () => replace(...args) };
      if (blocker(tx)) return; // 차단
      replace(...args);
    };

    return () => {
      navigator.push = push;
      navigator.replace = replace;
    };
  }, [navigator, blocker, when]);
}

export default function QPage({
  onClose,
  baseInfo,
  questions = DEFAULT_QUESTIONS,
}) {
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

  /* -------------------------------
     1. 브라우저 새로고침/닫기 방지
  --------------------------------*/
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

  /* -------------------------------
     2. 내부 라우터 이동 방지 (스와이프 포함)
  --------------------------------*/
  useBlocker((tx) => {
    if (step < TOTAL && step >= 0 && !submitting) {
      setShowLeaveModal(true);
      setPendingTx(tx);
      return true; // 이동 차단
    }
    return false;
  }, true);

  const confirmLeave = () => {
    if (pendingTx) {
      setShowLeaveModal(false);
      const retry = pendingTx.retry;
      setPendingTx(null);
      retry(); // 원래 가려던 라우팅 실행
    }
  };

  const cancelLeave = () => {
    setShowLeaveModal(false);
    setPendingTx(null);
  };

  /* -------------------------------
     3. 진행/제출 로직
  --------------------------------*/
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

      // 1) 서버 저장
      await api.put("/users/me/profile", payload);

      // 2) 최신 프로필 조회
      const resp = await api.get("/users/me/profile");
      const profileData = resp.data;

      // 3) ✅ 토큰/기타 필드 유지하며 user 병합 업데이트
      const prev = useUserStore.getState().user || {};
      useUserStore.getState().setUser({ ...prev, ...profileData });

      // 4) 점수 계산
      const scoreA = ab.filter((c) => c === "a").length;
      const scoreB = ab.filter((c) => c === "b").length;
      const dominant =
        scoreA === scoreB ? "BALANCED" : scoreA > scoreB ? "A-TYPE" : "B-TYPE";

      // 5) 복구용 백업 저장 (새로고침 대비)
      sessionStorage.setItem("q_answers", JSON.stringify(ab));
      sessionStorage.setItem("q_profile", JSON.stringify(profileData));
      sessionStorage.setItem("q_scoreA", String(scoreA));
      sessionStorage.setItem("q_scoreB", String(scoreB));
      sessionStorage.setItem("q_dominant", dominant);

      // 6) 결과 페이지 이동
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
      {/* ✅ 진행중일 때 Loader 표시 */}
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

      {/* 질문 */}
      <div className="qpage-card">
        <p className="qpage-question">{q.text}</p>
      </div>

      {/* 선택지 */}
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

      {/* ✅ 이탈 경고 모달 */}
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
