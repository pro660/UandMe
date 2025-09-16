import { useEffect, useState } from "react";

export default function Matching() {
  const [sentSignals, setSentSignals] = useState([]);
  const [receivedSignals, setReceivedSignals] = useState([]);
  const [peer, setPeer] = useState(null); // 🔑 매칭 상대 저장
  const [message, setMessage] = useState("");

  // 매칭 시작
  const startMatching = async () => {
    try {
      const resp = await fetch("https://api.likelionhsu.co.kr/api/match/start", {
        method: "POST",
        credentials: "include",
      });
      if (!resp.ok) throw new Error("매칭 실패");
      const data = await resp.json();
      setPeer(data.peer); // 🔑 상대 정보 저장
      setMessage(`매칭 성공! type=${data.type}, roomId=${data.roomId}`);
    } catch (err) {
      console.error(err);
      setMessage("매칭 중 오류 발생");
    }
  };

  // 신호 보내기
  const sendSignal = async (targetId) => {
    try {
      const resp = await fetch(`https://api.likelionhsu.co.kr/api/signals/${targetId}`, {
        method: "POST",
        credentials: "include",
      });
      if (!resp.ok) throw new Error("신호 보내기 실패");
      setMessage(`플러팅을 보냈습니다 → ${targetId}`);
      fetchSentSignals();
    } catch (err) {
      console.error(err);
      setMessage("플러팅 실패");
    }
  };

  // 신호 수락
  const acceptSignal = async (signalId) => {
    try {
      const resp = await fetch(`https://api.likelionhsu.co.kr/api/signals/${signalId}`, {
        method: "PATCH",
        credentials: "include",
      });
      if (!resp.ok) throw new Error("신호 수락 실패");
      const data = await resp.json();
      setMessage(`플러팅 수락 완료! roomId=${data.roomId}`);
    } catch (err) {
      console.error(err);
      setMessage("플러팅 수락 실패");
    }
  };

  // 보낸 신호 목록
  const fetchSentSignals = async () => {
    try {
      const resp = await fetch("https://api.likelionhsu.co.kr/api/signals/sent", {
        credentials: "include",
      });
      if (!resp.ok) throw new Error("보낸 신호 목록 조회 실패");
      const data = await resp.json();
      setSentSignals(data);
    } catch (err) {
      console.error(err);
    }
  };

  // 받은 신호 목록
  const fetchReceivedSignals = async () => {
    try {
      const resp = await fetch("https://api.likelionhsu.co.kr/api/signals/received", {
        credentials: "include",
      });
      if (!resp.ok) throw new Error("받은 신호 목록 조회 실패");
      const data = await resp.json();
      setReceivedSignals(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSentSignals();
    fetchReceivedSignals();
  }, []);

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
          <img src={peer.typeImageUrl2} alt="type2" width={100} />
        </div>
      )}

      <h3>보낸 신호 목록</h3>
      <ul>
        {sentSignals.map((s) => (
          <li key={s.id}>
            {s.targetId} (상태: {s.status})
          </li>
        ))}
      </ul>

      <h3>받은 신호 목록</h3>
      <ul>
        {receivedSignals.map((s) => (
          <li key={s.id}>
            {s.fromId} → 상태: {s.status}
            <button onClick={() => acceptSignal(s.id)}>수락하기</button>
          </li>
        ))}
      </ul>

      <h3>플러팅 보내기</h3>
      <input
        type="text"
        placeholder="상대 userId 입력 후 엔터"
        onKeyDown={(e) => {
          if (e.key === "Enter") sendSignal(e.target.value);
        }}
      />
    </div>
  );
}
