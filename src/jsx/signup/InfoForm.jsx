// src/jsx/InfoForm.jsx
import React, { useMemo, useState } from "react";
import api from "../../api/axios.js";
import "../../css/InfoForm.css";
import QPage from "./QPage.jsx";


/** 서버 스펙: GET /users/me/name/check?name=닉네임 */
async function checkNicknameAPI(name) {
  try {
    const resp = await api.get(`/users/me/name/check`, {
      params: { name }, // 쿼리스트링 자동 생성 → ?name=닉네임
    });

    const data = resp.data || {};
    const available =
      typeof data.available === "boolean" ? data.available : true;

    return { ok: true, available };
  } catch (err) {
    if (err.response?.status === 409) {
      // 이미 사용중
      return { ok: true, available: false };
    }
    return { ok: false };
  }
}

export default function InfoForm() {
  const [started, setStarted] = useState(false);

  const [nickname, setNickname] = useState("");
  const [birthYear, setBirthYear] = useState(""); // 출생년도
  const [year, setYear] = useState(""); // 학번(예: "22")
  const [gender, setGender] = useState("남자");
  const [major, setMajor] = useState("");

  const nickLen = nickname.length;
  const nickMax = 8;
  const nickOver = nickLen > nickMax;

  const [dupState, setDupState] = useState("idle"); // idle|checking|ok|taken|error

  const [sheetOpen, setSheetOpen] = useState(false);
  const [expanded, setExpanded] = useState({});

  const FACULTIES = useMemo(
    () => [
      {
        name: "해양·스포츠학부",
        majors: ["경호비서학과", "레저해양스포츠학과", "해양경찰학과"],
      },
      {
        name: "AI·SW학부",
        majors: ["항공AI소프트웨어학과", "AI로보틱스학과", "AI모빌리티학과"],
      },
      {
        name: "문화콘텐츠학부",
        majors: [
          "문화재보존학과",
          "미디어예술창작학과",
          "실용음악학과",
          "영화영상학과",
        ],
      },
      {
        name: "자유전공학부",
        majors: [
          "자유전공학과",
          "인문사회전공자유학과",
          "공학전공자유학과",
          "자연과학전공자유학과",
          "예체능전공자유학과",
        ],
      },
      {
        name: "충남RISE융합학부(계약학과)",
        majors: [
          "첨단항공학과",
          "항공서비스경영학과",
          "모빌리티융합디자인학과",
        ],
      },
      {
        name: "항공학부",
        majors: [
          "항공소프트웨어공학과",
          "항공산업공학과",
          "항공운항학과",
          "헬리콥터조종학과",
          "항공전자공학과",
          "무인항공기공학과",
          "항공교통물류학과",
          "항공정보통신공학과",
          "항공기계공학과",
          "항공보안학과",
          "공항행정학과",
        ],
      },
      {
        name: "항공융합학부",
        majors: [
          "항공컴퓨터학과",
          "호텔카지노관광학과",
          "식품공학과",
          "항공의료관광과",
          "국제관계학과",
          "신소재화학공학과",
          "환경·토목·건축학과",
          "전기전자공학과",
        ],
      },
      {
        name: "보건학부",
        majors: [
          "물리치료학과",
          "작업치료학과",
          "방사선학과",
          "간호학과",
          "치위생학과",
          "안전건설학과",
          "뷰티바이오산업학과",
          "사회복지학과",
          "의료재활학과",
          "수산생명의학과",
        ],
      },
      {
        name: "디자인엔터미디어학부",
        majors: [
          "문화재보존학과",
          "영화영상학과",
          "미디어예술창작학과",
          "영상애니메이션학과",
          "실용음악학과",
          "공간디자인학과",
          "산업디자인학과",
          "시각디자인학과",
          "패션디자인학과",
        ],
      },
    ],
    []
  );

  const YEAR_NOW = new Date().getFullYear();
  const BIRTHYEAR_MIN = YEAR_NOW - 36;
  const BIRTHYEAR_MAX = YEAR_NOW - 20;

  const toggleFaculty = (name) =>
    setExpanded((prev) => ({ ...prev, [name]: !prev[name] }));

  const onNicknameChange = (v) => {
    setNickname(v);
    if (dupState !== "idle") setDupState("idle");
  };

  const handleCheckNickname = async () => {
    if (!nickname || nickOver) return;
    setDupState("checking");
    try {
      const { ok, available } = await checkNicknameAPI(nickname.trim());
      if (!ok) {
        setDupState("error");
        return;
      }
      setDupState(available ? "ok" : "taken");
    } catch {
      setDupState("error");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (nickOver) return;

    const by = Number(birthYear);
    if (!by || by < BIRTHYEAR_MIN || by > BIRTHYEAR_MAX) {
      alert(`출생년도는 ${BIRTHYEAR_MIN} ~ ${BIRTHYEAR_MAX} 사이여야 합니다.`);
      return;
    }

    setSheetOpen(false);
    setStarted(true);
    window.scrollTo(0, 0);
  };

  if (started) {
    const handleCloseQPage = () => {
      setStarted(false);
      window.scrollTo(0, 0);
    };

    const baseInfo = {
      name: nickname.trim(),
      department: major,
      studentNo: String(year),
      birthYear: Number(birthYear),
      gender: gender === "남자" ? "MALE" : "FEMALE",
    };

    return <QPage onClose={handleCloseQPage} baseInfo={baseInfo} />;
  }

  return (
    <main className="profile-root">
      <div className="form-shell">
        <h1 className="page-title">정보를 입력하고 시작하세요</h1>

        <form className="info-form" onSubmit={handleSubmit} noValidate>
          {/* 닉네임 */}
          <div className="field">
            <label className="field-label" htmlFor="nickname">
              닉네임
            </label>
            <div className="nick-row">
              <div className={`input-wrap ${nickOver ? "is-error" : ""}`}>
                <input
                  id="nickname"
                  className="text-input"
                  type="text"
                  maxLength={24}
                  placeholder="닉네임을 입력하세요."
                  value={nickname}
                  onChange={(e) => onNicknameChange(e.target.value)}
                />
                <span className="count-badge">
                  {nickLen}/{nickMax}
                </span>
              </div>

              <button
                type="button"
                className="pill-btn"
                onClick={handleCheckNickname}
                disabled={!nickname || nickOver}
              >
                {dupState === "checking" ? "확인중..." : "중복확인"}
              </button>

              {dupState === "ok" && <span className="dup-done">확인 완료</span>}
              {dupState === "taken" && (
                <span className="dup-done">이미 사용중</span>
              )}
              {dupState === "error" && <span className="dup-done">오류</span>}
            </div>
            {nickOver && (
              <p className="hint-error">
                닉네임은 최대 8자까지 입력할 수 있어요.
              </p>
            )}
          </div>

          {/* 출생년도 / 학번 / 성별 */}
          <div className="grid-3">
            <div className="field">
              <label className="field-label" htmlFor="birthYear">
                출생년도
              </label>
              <div className="input-wrap">
                <input
                  id="birthYear"
                  className="text-input"
                  inputMode="numeric"
                  placeholder={`${BIRTHYEAR_MIN}~${BIRTHYEAR_MAX}`}
                  value={birthYear}
                  onChange={(e) =>
                    setBirthYear(e.target.value.replace(/\D/g, ""))
                  }
                />
              </div>
            </div>

            <div className="field">
              <label className="field-label" htmlFor="year">
                학번
              </label>
              <div className="input-wrap has-suffix">
                <input
                  id="year"
                  className="text-input"
                  inputMode="numeric"
                  placeholder="예: 22"
                  value={year}
                  onChange={(e) => setYear(e.target.value.replace(/\D/g, ""))}
                />
                <span className="suffix">학번</span>
              </div>
            </div>

            <div className="field">
              <label className="field-label" htmlFor="gender">
                성별
              </label>
              <div className="input-wrap">
                <select
                  id="gender"
                  className="select-input"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="남자">남자</option>
                  <option value="여자">여자</option>
                </select>
              </div>
            </div>
          </div>

          {/* 학과: 클릭 → 바텀시트 */}
          <div className="field">
            <label className="field-label" htmlFor="majorBtn">
              학과
            </label>
            <div
              id="majorBtn"
              role="button"
              className={`input-wrap input-clickable ${
                !major ? "placeholder" : ""
              }`}
              onClick={() => setSheetOpen(true)}
            >
              <span className="text-input as-text">
                {major || "학과를 선택하세요."}
              </span>
              <span className="chev" aria-hidden>
                ▾
              </span>
            </div>
          </div>

          {/* 제출 */}
          <div className="sticky-actions">
            <button
              className="primary-btn"
              type="submit"
              disabled={
                !nickname ||
                nickOver ||
                !birthYear ||
                !year ||
                !gender ||
                !major ||
                dupState !== "ok"
              }
            >
              다음으로
            </button>
          </div>
        </form>
      </div>

      {/* 바텀시트: 학부/학과 선택 */}
      {sheetOpen && (
        <>
          <div className="sheet-backdrop" onClick={() => setSheetOpen(false)} />
          <div className="sheet-panel">
            <div className="sheet-header">
              <strong>학과 선택</strong>
              <button
                className="sheet-close"
                type="button"
                onClick={() => setSheetOpen(false)}
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
                        onClick={() => toggleFaculty(name)}
                      >
                        <span className="caret" aria-hidden />
                        <span className="acc-title">{name}</span>
                      </button>
                      <div className={`acc-body ${open ? "open" : ""}`}>
                        <ul className="program-list">
                          {majors.map((m) => (
                            <li key={m}>
                              <button
                                type="button"
                                className={`program-item ${
                                  major === m ? "is-selected" : ""
                                }`}
                                onClick={() => {
                                  setMajor(m);
                                  setSheetOpen(false);
                                }}
                              >
                                {m}
                                {major === m && (
                                  <span className="check">✓</span>
                                )}
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
          </div>
        </>
      )}
    </main>
  );
}
