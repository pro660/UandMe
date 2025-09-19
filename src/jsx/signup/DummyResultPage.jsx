// src/jsx/question/DummyResultPage.jsx
import React from "react";
import ResultPage from "./ResultPage.jsx";

export default function DummyResultPage() {
  // ✅ 하드코딩된 더미 데이터
  const dummyUser = {
    name: "홍길동",
    department: "컴퓨터공학과",
    studentNo: "20231234",
    birthYear: "2002",
    gender: "남",
    typeTitle: "따뜻한 리더형",
    typeContent: "항상 주변을 잘 챙기며, 배려심이 깊고 리더십이 돋보이는 타입이에요.",
    typeImageUrl2: "https://via.placeholder.com/150", // 테스트용 이미지
    styleSummary: "사람들과 쉽게 친해지고, 책임감이 강한 성격",
    recommendedPartner: "차분하고 안정적인 성격의 사람",
    tags: ["리더십", "배려", "따뜻함"],
    instagramUrl: "https://instagram.com/testuser",
  };

  // Zustand store를 안 거치고 props로 주입하기 위해
  // ResultPage를 래핑한 형태로 테스트
  return <ResultPageWrapper dummyUser={dummyUser} />;
}

// ✅ ResultPage를 props 기반으로 테스트 가능하도록 래퍼 작성
function ResultPageWrapper({ dummyUser }) {
  // store 대신 더미 데이터로 store를 대체
  return <ResultPage hideHomeButton={true} user={dummyUser} />;
}
