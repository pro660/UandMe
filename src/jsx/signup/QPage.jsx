// src/pages/QPage.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios.js";
import useUserStore from "../../api/userStore.js";

/** 기본 문항(필요시 외부에서 questions prop으로 대체 가능) */
const DEFAULT_QUESTIONS = [
  { id: 1, text: "새로운 사람을 만날 때, 당신은 주로 어떤 상황을 선호하나요?",
    options: ["친구들과 함께하는 편안하고 시끌벅적한 모임", "조용하고 분위기 좋은 카페나 레스토랑에서의 일대일 대화"] },
  { id: 2, text: "데이트 상대를 고를 때, 가장 중요하게 생각하는 것은 무엇인가요?",
    options: ["유머러스하고 즐거운 시간을 보낼 수 있는 사람", "진지하고 깊이 있는 대화를 나눌 수 있는 사람"] },
  { id: 3, text: "주말에 가장 하고 싶은 데이트는 무엇인가요?",
    options: ["활기 넘치는 야외 활동 (등산, 자전거 타기 등)", "실내에서 즐기는 편안한 활동 (영화 보기, 맛집 탐방 등)"] },
  { id: 4, text: "갈등 상황에서 당신의 주된 태도는 무엇인가요?",
    options: ["문제를 회피하기보다 직접적으로 소통하고 해결하려 한다.", "상대방의 의견을 먼저 듣고 배려하며 부드럽게 대처한다."] },
  { id: 5, text: "데이트 상대의 외모와 스타일 중, 어떤 것에 더 끌리나요?",
    options: ["힙하고 트렌디한 스타일, 강렬한 인상", "깔끔하고 단정한 스타일, 부드러운 인상"] },
  { id: 6, text: "어떤 데이트를 더 좋아하나요?",
    options: ["즉흥적이고 계획되지 않은 데이트", "미리 계획하고 준비한 안정적인 데이트"] },
  { id: 7, text: "애정 표현 방식은 주로 어떤가요?",
    options: ["솔직하고 직접적으로 표현하는 편이다.", "은근하고 섬세하게 마음을 전하는 편이다."] },
  { id: 8, text: "관계에서 당신이 추구하는 가장 큰 가치는 무엇인가요?",
    options: ["서로에게 새로운 활력을 불어넣는 흥미로움", "편안함과 신뢰를 바탕으로 한 안정감"] },
  { id: 9, text: "처음 만난 사람에게 주로 어떤 질문을 하나요?",
    options: ['“취미가 뭐예요?” “주로 뭐하고 노세요?” 와 같이 가볍고 친근한 질문',
              '“어떤 가치관을 가지고 있나요?” “인생에서 중요한 것이 무엇인가요?” 와 같이 깊이 있는 질문'] },
  { id: 10, text: "데이트 상대와 있을 때, 당신의 모습은?",
    options: ["재미있는 분위기를 주도하고 리드하는 편이다.", "상대방의 이야기에 귀 기울이고 잘 맞춰주는 편이다."] },
];

export default function QPage({ onClose, baseInfo, questions = DEFAULT_QUESTIONS }) {
  const navigate = useNavigate();

  const TOTAL = questions.length;
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(Array(TOTAL).fill(null)); // 0(a)/1(b)
  const [choice, setChoice] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const q = questions[step];
  const displayNo = useMemo(() => String(step + 1).padStart(2, "0"), [step]);

  const handleConfirm = async () => {
    if (choice === null) return;

    const next = answers.slice();
    next[step] = choice;
    setAnswers(next);

    // 다음 문항으로
    if (step < TOTAL - 1) {
      setStep((s) => s + 1);
      setChoice(next[step + 1]);
      return;
    }

    // 마지막 문항 → 제출
    try {
      setSubmitting(true);

      // 0 → "a", 1 → "b"
      const ab = next.map((v) => (v === 0 ? "a" : "b"));
      const qPayload = {
        q1: ab[0], q2: ab[1], q3: ab[2], q4: ab[3], q5: ab[4],
        q6: ab[5], q7: ab[6], q8: ab[7], q9: ab[8], q10: ab[9],
      };

      // InfoForm에서 넘겨준 기본 정보 + 문항 응답
      const payload = {
        ...baseInfo, // { name, department, studentNo, birthYear, gender: "MALE"/"FEMALE" }
        ...qPayload,
      };

      // ✅ 토큰 자동첨부되는 axios 인스턴스로 PUT
      await api.put("/users/me/profile", payload);

      // ✅ 최신 프로필 GET 후 전역 상태 & localStorage에 저장
      const resp = await api.get("/users/me/profile");
      const profileData = resp.data;
      useUserStore.getState().setUser(profileData);

      // 간단 결과 계산
      const scoreA = ab.filter((c) => c === "a").length;
      const scoreB = ab.filter((c) => c === "b").length;
      const dominant = scoreA === scoreB ? "BALANCED" : (scoreA > scoreB ? "A-TYPE" : "B-TYPE");

      // 결과 페이지 이동 (라우팅 경로는 프로젝트에 맞춰 사용)
      navigate("/match/result", {
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
      if (onClose) return onClose(); // InfoForm으로 복귀
      window.history.back();
    } else {
      setStep((s) => s - 1);
      setChoice(answers[step - 1]);
    }
  };

  if (!q) return <div className="qpage-error">문항 데이터를 불러오지 못했어요.</div>;

  return (
    <div className="qpage">
      {/* 상단: 뒤로가기 + 진행도(10칸) */}
      <div className="qpage-top">
        <button className="qpage-back" onClick={handleBack} type="button">←</button>
        <div
          className="qpage-progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={TOTAL}
          aria-valuenow={step + 1}
        >
          <div className="qpage-progress-fill" style={{ width: `${((step + 1) / TOTAL) * 100}%` }} />
        </div>
      </div>

      {/* 하트 + 번호 */}
      <div className="qpage-heart">
        <span className="qpage-heart-icon" aria-hidden>❤</span>
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

      {/* 확인 */}
      <button
        className="qpage-confirm"
        onClick={handleConfirm}
        disabled={choice === null || submitting}
        type="button"
      >
        {step === TOTAL - 1 ? (submitting ? "제출 중..." : "결과 보기") : "확인"}
      </button>
    </div>
  );
}
