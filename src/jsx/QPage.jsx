// src/pages/QPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// ✅ 토큰/리프레시가 붙어있는 axios 인스턴스 (수정 금지 파일)
import api from "../api/axios.js";
import useUserStore from "../api/userStore.js";

/** 절대 URL: axios.js의 baseURL(4000/api)와 무관하게 8080 서버를 확실히 찍음 */
const PROFILE_URL_ABS = "http://localhost:8080/users/me/profile";

/** 10가지 데이팅 스타일 설문지 */
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

export default function QPage({ onClose, questions = DEFAULT_QUESTIONS }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUserStore(); // 필요 시 user.profile 힌트로 사용

  /** 전 페이지에서 넘겨준 힌트(없어도 동작) */
  const hinted = (location && location.state) || null;

  /** 실제로 PATCH에 쓸 프로필 원천 데이터 */
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const TOTAL = questions.length;
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(Array(TOTAL).fill(null)); // 0(a)/1(b)
  const [choice, setChoice] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const q = questions[step];
  const displayNo = useMemo(() => String(step + 1).padStart(2, "0"), [step]);

  /** 초기 프로필 채우기 전략
   *  1) 라우팅 state(hinted)
   *  2) store.user.profile (있다면)
   *  3) 최종 GET /users/me/profile 로 서버에서 가져오기
   */
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        // 1) 라우팅 힌트
        if (hinted) {
          setProfile(hinted);
          return;
        }

        // 2) 전역 store의 프로필 힌트
        const storeProfile = user?.profile;
        if (storeProfile) {
          setProfile(storeProfile);
          return;
        }

        // 3) 서버에서 확정값 GET (axios 인스턴스가 토큰/리프레시 처리)
        const { data } = await api.get(PROFILE_URL_ABS);
        if (mounted) setProfile(data);
      } catch (e) {
        // 프로필이 꼭 필요하다면 이 시점에 온보딩/로그인 등으로 보낼 수 있음
        console.error("프로필 불러오기 실패:", e);
      } finally {
        if (mounted) setLoadingProfile(false);
      }
    })();

    return () => { mounted = false; };
  }, [hinted, user]);

  const handleSelect = (idx) => setChoice(idx);

  const handleConfirm = async () => {
    if (choice === null) return;

    const next = answers.slice();
    next[step] = choice;
    setAnswers(next);

    if (step < TOTAL - 1) {
      setStep((s) => s + 1);
      setChoice(next[step + 1]);
      return;
    }

    // 마지막 문항 → 프로필 업데이트
    try {
      setSubmitting(true);

      // 프로필 소스가 없으면 안전하게 방지
      const base = profile || {};
      const payload = {
        // 서버 스펙에 맞춰 InfoForm과 동일한 키 유지
        name: base.name,
        department: base.department,
        studentNo: base.studentNo,
        age: base.age,
        gender: base.gender,

        // 성격/취향 테스트는 나중에 추가
        // personalityTest: { answers: next, scoreA, scoreB, version: 1 },
      };

      // ✅ 절대 URL 사용 → axios.js의 baseURL과 상관없이 8080 서버로 보냄
      await api.patch(PROFILE_URL_ABS, payload);

      // 결과 페이지로 이동 (즉시 표시용 힌트로만 전달)
      navigate("/match/result", { state: { ...payload } });
    } catch (e) {
      console.error(e);
      alert("프로필 저장 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (step === 0) {
        if (onClose) return onClose(); // ✅ 폼 화면으로 복귀
      navigate(-1);
    } else {
      setStep((s) => s - 1);
      setChoice(answers[step - 1]);
    }
  };

  // (선택) 프로필 로딩 중 표시
  if (loadingProfile && !hinted && !user?.profile) {
    return <div className="qpage-loading">Loading...</div>;
  }

  return (
    <div className="qpage">
      {/* 상단: 뒤로가기 + 진행도(10칸) */}
      <div className="qpage-top">
        <button className="qpage-back" onClick={handleBack} type="button">←</button>
        <div className="qpage-progress" role="progressbar" aria-valuemin={0} aria-valuemax={TOTAL} aria-valuenow={step}>
          <div className="qpage-progress-fill" style={{ width: `${(step / TOTAL) * 100}%` }} />
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
            onClick={() => handleSelect(idx)}
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
        {step === TOTAL - 1 ? (submitting ? "제출 중..." : "확인") : "확인"}
      </button>
    </div>
  );
}
