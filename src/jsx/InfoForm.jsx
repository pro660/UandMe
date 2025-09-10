import React, { useMemo, useState } from "react";
import "../css/InfoForm.css";

/** ===== API BASE 안전 설정 =====
 * 절대 URL이 아니면 8080으로 폴백하여 개발/Mock 동작이 안정적이게.
 * CRA: REACT_APP_API_BASE_URL / Vite: VITE_API_BASE_URL (아래 CRA 예시)
 */
const RAW_BASE = process.env.REACT_APP_API_BASE_URL?.trim();
const IS_ABS_URL = /^https?:\/\//i.test(RAW_BASE || "");
const API_BASE = IS_ABS_URL ? RAW_BASE : "http://localhost:8080";

const CHECK_URL = `${API_BASE}/users/me/name/check`;
const PROFILE_URL = `${API_BASE}/users/me/profile`;

/** 유틸 */
const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
const toIntOrBlank = (v) => {
  const n = parseInt(String(v).replace(/\D/g, ""), 10);
  return Number.isNaN(n) ? "" : n;
};

/** 타임아웃 fetch */
async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 3000 } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const resp = await fetch(resource, { ...options, signal: controller.signal });
    clearTimeout(id);
    return resp;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
}

/** ===== Mock 로직 ===== */
function mockCheckNickname(code) {
  const available = code.length % 2 === 0; // 짝수 길이 → 사용 가능
  return new Promise((resolve) =>
    setTimeout(() => resolve({ ok: true, available, mock: true, message: "(Mock)" }), 400)
  );
}

function mockPostProfile(body) {
  // 서버가 없을 때 프론트 확인용으로 성공 응답 시뮬레이션
  // 실제 저장은 안 되지만, 화면에서 결과 확인 가능
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          ok: true,
          mock: true,
          data: { id: Date.now(), ...body },
          message: "프로필 등록(Mock) 완료",
        }),
      500
    )
  );
}

/** 실제 API 호출 + 실패 시 Mock 폴백 */
async function checkNicknameAPI(code) {
  try {
    const resp = await fetchWithTimeout(CHECK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
      timeout: 3000,
    });
    console.log("[CHECK] URL:", CHECK_URL, "Status:", resp.status);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json().catch(() => ({}));
    const available = typeof data.available === "boolean" ? data.available : true;
    return { ok: true, available, mock: false, message: data.message };
  } catch (e) {
    console.warn("[CHECK] Fallback to Mock:", e?.message);
    return await mockCheckNickname(code);
  }
}

async function postProfileAPI(body) {
  try {
    const resp = await fetchWithTimeout(PROFILE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      timeout: 4000,
    });
    console.log("[PROFILE] URL:", PROFILE_URL, "Status:", resp.status, "Body:", body);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json().catch(() => ({}));
    return { ok: true, mock: false, data, message: data?.message || "프로필 등록 완료" };
  } catch (e) {
    console.warn("[PROFILE] Fallback to Mock:", e?.message, "Body:", body);
    return await mockPostProfile(body);
  }
}

export default function InfoForm({ onSubmit, onCheckNickname }) {
  /** 입력값 */
  const [nickname, setNickname] = useState("");
  const [age, setAge] = useState("");       // 숫자 직접 입력
  const [year, setYear] = useState("");     // 숫자 직접 입력 (학번)
  const [gender, setGender] = useState(""); // select 유지
  const [major, setMajor] = useState("");   // 바텀시트에서 선택

  /** 닉네임 카운터 */
  const nickLen = nickname.length;
  const nickMax = 8;
  const nickOver = nickLen > nickMax;

  /** 중복확인 상태 */
  // idle|checking|ok|taken|error
  const [dupState, setDupState] = useState("idle");
  const [dupMsg, setDupMsg] = useState("");
  const [dupMock, setDupMock] = useState(false);

  /** 제출 상태 */
  // idle|submitting|success|error
  const [submitState, setSubmitState] = useState("idle");
  const [submitMsg, setSubmitMsg] = useState("");
  const [submitMock, setSubmitMock] = useState(false);

  /** 바텀시트/아코디언 */
  const [sheetOpen, setSheetOpen] = useState(false);
  const [expanded, setExpanded] = useState({});

  /** 학부/학과 데이터(샘플) */
  const FACULTIES = useMemo(() => [
    { name: "해양·스포츠학부", majors: ["경호비서학과", "레저해양스포츠학과", "해양경찰학과"] },
    { name: "AI·SW부", majors: ["항공AI소프트웨어전공", "AI로보틱스학과", "시모빌리티학과"] },
    { name: "문화콘텐츠학부", majors: ["문화재보존학과","미디어예술창작학과","실용음악학과","영화영상학과"] },
    { name: "자유전공학부", majors: ["자유전공학부"] },
    { name: "충남RISE융합학부(계약학과)", majors: ["항공서비스경영학과","모빌리티융합디자인학과"] },
    { name: "항공학부", majors: ["항공소프트웨어공학과","항공산업공학과","항공소재공학과","헬리콥터조종학과","항공전자공학과","무인이동체공학과","항공교통물류학과","항공정보통신공학과","항공보안학과","공항행정학과"] },
    { name: "항공관광학부", majors: ["항공컴퓨터학과","호텔카지노관광학과","식품영양학과","항공의료관광과","국제관계학과","신소재화학공학과","항·토목·건축학과","전기전자공학과"] },
    { name: "보건학부", majors: ["물리치료학과","작업치료학과","방사선학과","간호학과","치위생학과","안전건설학과","뷰티화장품산업학과","사회복지학과","의료재활학과","수산생명의학과"] },
    { name: "디자인엔터미디어학부", majors: ["문화재보존학과","영화영상학과","미디어예술창작학과","영상애니메이션학과","실용음악학과","공간디자인학과","산업디자인학과","시각디자인학과","패션디자인학과"] },
  ], []);

  /** 숫자 범위 */
  const AGE_MIN = 18, AGE_MAX = 40;
  const YEAR_MIN = 15, YEAR_MAX = 24;

  /** 학부 아코디언 토글 */
  const toggleFaculty = (name) =>
    setExpanded((prev) => ({ ...prev, [name]: !prev[name] }));

  /** 닉네임 변경 시 중복확인 초기화 */
  const onNicknameChange = (v) => {
    setNickname(v);
    if (dupState !== "idle") {
      setDupState("idle");
      setDupMsg("");
      setDupMock(false);
    }
  };

  /** 중복확인 실행 */
  const handleCheckNickname = async () => {
    if (!nickname || nickOver) return;
    setDupState("checking");
    setDupMsg("");
    setDupMock(false);

    const result = await checkNicknameAPI(nickname.trim());
    if (!result.ok) {
      setDupState("error");
      setDupMsg("확인 중 오류가 발생했어요.");
      setDupMock(!!result.mock);
      return;
    }
    if (result.available) {
      setDupState("ok");
      setDupMsg(result.mock ? "사용 가능 (Mock)" : "사용 가능한 닉네임이에요.");
      setDupMock(result.mock);
    } else {
      setDupState("taken");
      setDupMsg(result.mock ? "이미 사용중 (Mock)" : "이미 사용 중인 닉네임이에요.");
      setDupMock(result.mock);
    }
  };

  /** 제출 */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (nickOver) return;

    const a = toIntOrBlank(age);
    const y = toIntOrBlank(year);
    const ageOk = a !== "" && a >= AGE_MIN && a <= AGE_MAX;
    const yearOk = y !== "" && y >= YEAR_MIN && y <= YEAR_MAX;
    const genderOk = !!gender;
    const majorOk = !!major;
    const dupOk = dupState === "ok"; // 중복확인 통과 필요

    if (!ageOk || !yearOk || !genderOk || !majorOk || !dupOk) return;

    const body = {
      name: nickname.trim(),
      department: major,
      studentNo: String(y),
      age: a,
    };

    setSubmitState("submitting");
    setSubmitMsg("");
    setSubmitMock(false);

    const result = await postProfileAPI(body);

    if (result.ok) {
      setSubmitState("success");
      setSubmitMsg(result.message || "프로필 등록이 완료되었습니다.");
      setSubmitMock(!!result.mock);
      onSubmit?.(body); // 외부 핸들러에도 전달 (필요 없으면 제거 가능)
    } else {
      setSubmitState("error");
      setSubmitMsg(result.message || "프로필 등록에 실패했어요.");
      setSubmitMock(!!result.mock);
    }
  };

  return (
    <main className="profile-root">
      <div className="form-shell">
        <h1 className="page-title">정보를 입력하고 시작하세요</h1>

        {/* 제출 결과 배너 */}
        {submitState !== "idle" && (
          <div
            className={`submit-hint ${
              submitState === "success" ? "ok" : submitState === "error" ? "error" : "progress"
            }`}
            role="status"
            aria-live="polite"
          >
            <strong>
              {submitState === "success"
                ? "등록 성공"
                : submitState === "error"
                ? "등록 실패"
                : "등록 중"}
            </strong>
            <span className="msg">
              {submitMsg || (submitState === "submitting" ? "서버로 전송 중..." : "")}
              {submitMock && " (Mock)"}
            </span>
          </div>
        )}

        <form className="info-form" onSubmit={handleSubmit} noValidate>
          {/* 닉네임 */}
          <div className="field">
            <label className="field-label" htmlFor="nickname">닉네임</label>

            <div className="nick-row">
              <div className={`input-wrap ${nickOver ? "is-error" : ""}`}>
                <input
                  id="nickname"
                  className="text-input"
                  type="text"
                  inputMode="text"
                  maxLength={24} /* 하드컷(표시는 8자) */
                  placeholder="닉네임을 입력하세요."
                  value={nickname}
                  onChange={(e) => onNicknameChange(e.target.value)}
                />
                <span className="count-badge" aria-live="polite">
                  {nickLen}/{nickMax}
                </span>
              </div>

              <button
                type="button"
                className="pill-btn"
                onClick={handleCheckNickname}
                disabled={!nickname || nickOver || dupState === "checking"}
              >
                {dupState === "checking" ? "확인중..." : "중복확인"}
              </button>
            </div>

            {/* 닉네임 상태 */}
            {nickOver && <p className="hint-error">닉네임은 최대 8자까지 입력할 수 있어요.</p>}
            {!nickOver && dupState !== "idle" && (
              <p
                className={`api-hint ${
                  dupState === "ok" ? "ok" : dupState === "taken" ? "taken" : dupState === "error" ? "error" : ""
                }`}
              >
                <span
                  className={`status-badge ${
                    dupState === "ok" ? "ok" : dupState === "taken" ? "taken" : dupState === "error" ? "error" : "checking"
                  }`}
                >
                  {dupState === "ok" ? "사용 가능" : dupState === "taken" ? "사용중" : dupState === "error" ? "오류" : "확인중"}
                </span>
                <span className="api-msg">
                  {dupMsg || (dupState === "checking" ? "서버에 확인 중..." : "")}
                  {dupMock && " (모의 응답)"}
                </span>
              </p>
            )}
          </div>

          {/* 3열: 나이 / 학번 / 성별 */}
          <div className="grid-3">
            {/* 나이 */}
            <div className="field">
              <label className="field-label" htmlFor="age">나이</label>
              <div className="input-wrap">
                <input
                  id="age"
                  className="text-input"
                  inputMode="numeric"
                  autoComplete="off"
                  pattern="[0-9]*"
                  placeholder={`${AGE_MIN}~${AGE_MAX}`}
                  value={age}
                  onChange={(e) => {
                    const onlyNum = e.target.value.replace(/\D/g, "");
                    setAge(onlyNum);
                  }}
                  onBlur={() => {
                    const v = toIntOrBlank(age);
                    if (v === "") return;
                    setAge(String(clamp(v, AGE_MIN, AGE_MAX)));
                  }}
                />
              </div>
            </div>

            {/* 학번 */}
            <div className="field">
              <label className="field-label" htmlFor="year">학번</label>
              <div className="input-wrap has-suffix">
                <input
                  id="year"
                  className="text-input"
                  inputMode="numeric"
                  autoComplete="off"
                  pattern="[0-9]*"
                  placeholder={`${YEAR_MIN}~${YEAR_MAX}`}
                  value={year}
                  onChange={(e) => {
                    const onlyNum = e.target.value.replace(/\D/g, "");
                    setYear(onlyNum);
                  }}
                  onBlur={() => {
                    const v = toIntOrBlank(year);
                    if (v === "") return;
                    setYear(String(clamp(v, YEAR_MIN, YEAR_MAX)));
                  }}
                />
                <span className="suffix">학번</span>
              </div>
            </div>

            {/* 성별 */}
            <div className="field">
              <label className="field-label" htmlFor="gender">성별</label>
              <div className="input-wrap">
                <select
                  id="gender"
                  className="select-input"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="" disabled>선택</option>
                  <option value="남자">남자</option>
                  <option value="여자">여자</option>
                  <option value="기타">기타</option>
                </select>
              </div>
            </div>
          </div>

          {/* 학과: 클릭 → 바텀시트 */}
          <div className="field">
            <label className="field-label" htmlFor="majorBtn">학과</label>
            <div
              id="majorBtn"
              role="button"
              tabIndex={0}
              className={`input-wrap input-clickable ${!major ? "placeholder" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSheetOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  setSheetOpen(true);
                }
              }}
            >
              <span className="text-input as-text">
                {major || "학과를 선택하세요."}
              </span>
              <span className="chev" aria-hidden>▾</span>
            </div>
          </div>

          {/* 안내문 */}
          <ul className="notice">
            <li>회원 정보는 최초 입력 후 수정이 불가합니다. 신중하게 확인하시어 정확하게 입력해 주시기 바랍니다.</li>
          </ul>

          {/* 제출 */}
          <div className="sticky-actions">
            <button
              className="primary-btn"
              type="submit"
              disabled={
                !nickname || nickOver ||
                !age || !year || !gender || !major ||
                dupState !== "ok" ||
                submitState === "submitting"
              }
            >
              {submitState === "submitting" ? "등록 중..." : "확인"}
            </button>
          </div>
        </form>
      </div>

      {/* === 바텀시트: 학과 선택 (학부 아코디언) === */}
      {sheetOpen && (
        <>
          <div
            className="sheet-backdrop"
            onClick={(e) => {
              if (e.currentTarget === e.target) setSheetOpen(false);
            }}
          />
          <div
            className="sheet-panel"
            role="dialog"
            aria-modal="true"
            aria-label="학과 선택"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sheet-header">
              <strong>학과 선택</strong>
              <button
                className="sheet-close"
                type="button"
                onClick={() => setSheetOpen(false)}
                aria-label="닫기"
              >
                ✕
              </button>
            </div>

            <div className="sheet-body">
              <ul className="acc-list">
                {FACULTIES.map(({ name, majors }) => {
                  const open = !!expanded[name];
                  return (
                    <li key={name} className="acc-item">
                      <button
                        type="button"
                        className={`acc-header ${open ? "is-open" : ""}`}
                        aria-expanded={open}
                        onClick={() => toggleFaculty(name)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            toggleFaculty(name);
                          }
                        }}
                      >
                        <span className="caret" aria-hidden />
                        <span className="acc-title">{name}</span>
                      </button>

                      <div
                        className={`acc-body ${open ? "open" : ""}`}
                        style={{ maxHeight: open ? majors.length * 48 + 16 + "px" : 0 }}
                      >
                        <ul className="program-list">
                          {majors.map((m) => (
                            <li key={m}>
                              <button
                                type="button"
                                className={`program-item ${major === m ? "is-selected" : ""}`}
                                onClick={() => {
                                  setMajor(m);
                                  setSheetOpen(false);
                                }}
                              >
                                {m}
                                {major === m && <span className="check" aria-hidden>✓</span>}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="sheet-footer">
              <button type="button" className="sheet-cancel" onClick={() => setSheetOpen(false)}>취소</button>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
