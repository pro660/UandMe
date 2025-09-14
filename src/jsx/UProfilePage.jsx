// src/jsx/UProfilePage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BsArrowLeftCircle } from "react-icons/bs";

import api from "../api/axios";                 // baseURL = REACT_APP_API_URL
import "../css/UProfilePage.css";
import dummyDog from "../image/dummydog.svg";   // 이미지 실패 시 대체

export default function UProfilePage() {
  const navigate = useNavigate();
  const { userId } = useParams(); // 라우트: /profile/:userId

  // ------- 상태 -------
  const [profile, setProfile] = useState(null);               // API 응답(매핑 후)
  const [status, setStatus]   = useState({ loading: true, error: null });
  const [imgSrc, setImgSrc]   = useState(dummyDog);           // 마스코트 이미지

  // ------- 데이터 패치 -------
  useEffect(() => {
    let alive = true;

    if (!userId) {
      setStatus({ loading: false, error: "NO_ID" });
      return () => { alive = false; };
    }

    (async () => {
      try {
        // .env의 REACT_APP_API_URL이 baseURL이므로 상대경로만 호출
        const { data } = await api.get(`/users/${userId}/detail`);
        if (!alive) return;

        // 서버 응답을 화면에서 쓰기 좋게 매핑
        const mapped = {
          name: data?.name ?? "",
          department: data?.department ?? "",
          studentNo: data?.studentNo ? `${data.studentNo}학번` : "",
          birthYear: data?.birthYear ? `${String(data.birthYear).slice(2)}년생` : "",
          gender: data?.gender ?? "", // "남자" / "여자"
          loveTypeTitle: data?.typeTitle ?? "",
          loveTypeDesc: data?.typeContent ?? "",
          styleSummary: data?.styleSummary ?? "",
          recommendedPartner: data?.recommendedPartner ?? "",
          tags: Array.isArray(data?.tags) ? data.tags : [],
          mascotUrl: data?.typeImageUrl || "",
          introduce: data?.introduce ?? null,
        };

        setProfile(mapped);
        setImgSrc(mapped.mascotUrl || dummyDog);
        setStatus({ loading: false, error: null });
      } catch (err) {
        setProfile(null);
        setStatus({ loading: false, error: err?.response?.status || "ERR" });
      }
    })();

    return () => { alive = false; };
  }, [userId]);

  // ------- 뷰 렌더링 분기 -------
  if (status.loading) {
    return (
      <main className="UProfilePage">
        <button className="up-back" type="button" onClick={() => navigate(-1)}>
          <BsArrowLeftCircle size={22} color="#444" />
          <span className="sr-only">뒤로가기</span>
        </button>
        <div style={{ marginTop: "5rem", textAlign: "center" }}>불러오는 중…</div>
        <div className="arch-box" />
      </main>
    );
  }

  if (status.error || !profile) {
    const msg =
      status.error === "NO_ID"
        ? "잘못된 접근입니다."
        : status.error === 403
        ? "비공개 프로필이거나 권한이 없습니다."
        : status.error === 404
        ? "존재하지 않는 사용자입니다."
        : "프로필을 불러오지 못했습니다.";

    return (
      <main className="UProfilePage">
        <button className="up-back" type="button" onClick={() => navigate(-1)}>
          <BsArrowLeftCircle size={22} color="#444" />
          <span className="sr-only">뒤로가기</span>
        </button>
        <div style={{ marginTop: "5rem", textAlign: "center", color: "#b04a4a" }}>
          {msg}
        </div>
        <div className="arch-box" />
      </main>
    );
  }

  const {
    name,
    department,
    birthYear,
    studentNo,
    gender,
    loveTypeTitle,
    loveTypeDesc,
    styleSummary,
    recommendedPartner,
    tags = [],
  } = profile;

  return (
    <main className="UProfilePage">
      {/* 상단 뒤로가기 (브라우저 히스토리) */}
      <button className="up-back" type="button" onClick={() => navigate(-1)}>
        <BsArrowLeftCircle size={22} color="#444" />
        <span className="sr-only">뒤로가기</span>
      </button>

      {/* 말풍선 */}
      <div className="up-speech">
        <span>반갑습니다.</span>
        <i className="up-speech-tail" aria-hidden />
      </div>

      {/* 마스코트 + 태그 */}
      <section className="up-mascot-wrap">
        <div className="up-mascot-plate">
          <img
            className="up-mascot"
            src={imgSrc}
            alt="캐릭터"
            onError={() => setImgSrc(dummyDog)}
          />
          {tags[1] && <span className="up-tag up-tag--left">#{tags[1]}</span>}
          {tags[0] && <span className="up-tag up-tag--right">#{tags[0]}</span>}
          {tags[2] && <span className="up-tag up-tag--bottom">#{tags[2]}</span>}
          <div className="up-shadow" aria-hidden />
        </div>
      </section>

      {/* 프로필 기본 정보 */}
      <section className="up-profile">
        <h1 className="up-name">{name}</h1>
        <p className="up-dept">{department}</p>
        <ul className="up-brief">
          {birthYear && <li>{birthYear}</li>}
          {studentNo && <li>{studentNo}</li>}
          {gender && <li>{gender}</li>}
        </ul>
      </section>

      {/* 연애 유형 카드 */}
      <section className="up-type-card">
        <p><b>{name}</b>님의 연애 유형은</p>
        <p className="up-type-strong"><b>{loveTypeTitle}</b> 입니다.</p>
        {loveTypeDesc && <p className="up-type-desc">{loveTypeDesc}</p>}
        {styleSummary && <p className="up-type-summary">{styleSummary}</p>}
        {recommendedPartner && (
          <p className="up-type-summary" style={{ marginTop: ".4rem" }}>
            <b>추천 상성</b> — {recommendedPartner}
          </p>
        )}
      </section>

      {/* 하단 아치 */}
      <div className="arch-box" />
    </main>
  );
}
