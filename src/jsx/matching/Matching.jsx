import { useState } from "react";
import api from "../../api/axios"; // ✅ axios 인스턴스
import useMatchingStore from "../../api/matchingStore"; // ✅ 전역 매칭 스토어

export default function Matching() {

  const [message, setMessage] = useState("");

  // ✅ 전역 매칭 상태
  const peer = useMatchingStore((s) => s.peer);
  const setMatch = useMatchingStore((s) => s.setMatch);

  // 매칭 시작
  const startMatching = async () => {
    try {
      const resp = await api.post("/match/start");
      const data = resp.data;

      if (data.candidates && data.candidates.length > 0) {
        const candidate = data.candidates[0];
        setMatch({ peer: candidate }); // ✅ 전역 저장
        setMessage(`매칭 성공! 상대: ${candidate.name}`);
      } else {
        setMessage("매칭된 상대가 없습니다.");
      }
    } catch (err) {
      console.error("❌ 매칭 실패:", err);
      setMessage("매칭 중 오류 발생");
    }
  };



  return (
    <div>
      <h2>매칭</h2>
      <button onClick={startMatching}>매칭 시작</button>
      <p>{message}</p>

      {/* 🔑 매칭된 상대 정보 표시 */}
      {peer && (
        <div>
          <h3>상대 정보</h3>
          <p>이름: {peer.name}</p>
          <p>학과: {peer.department}</p>
          <p>소개: {peer.introduce || "소개 없음"}</p>
          <img src={peer.typeImageUrl} alt="type1" width={100} />
          {peer.typeImageUrl2 && (
            <img src={peer.typeImageUrl2} alt="type2" width={100} />
          )}
        </div>
      )}
    </div>
  );
}
