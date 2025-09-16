import { useEffect, useState } from "react";
import api from "../../api/axios"; // ✅ axios 인스턴스
import useMatchingStore from "../../api/matchingStore"; // ✅ 전역 매칭 스토어
import { db } from "../../libs/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import useUserStore from "../../api/userStore"; // ✅ 로그인 유저 정보

export default function Matching() {
  const [sentSignals, setSentSignals] = useState([]);
  const [receivedSignals, setReceivedSignals] = useState([]);
  const [message, setMessage] = useState("");

  // ✅ 전역 매칭 상태
  const peer = useMatchingStore((s) => s.peer);
  const setMatch = useMatchingStore((s) => s.setMatch);

  // ✅ 로그인 유저
  const user = useUserStore((s) => s.user);
  const userId = user?.userId;

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

  // 신호 보내기
  const sendSignal = async (targetId) => {
    try {
      await api.post(`/signals/${targetId}`);
      setMessage(`플러팅을 보냈습니다 → ${targetId}`);
      fetchSentSignals();
    } catch (err) {
      console.error("❌ 신호 보내기 실패:", err);
      setMessage("플러팅 실패");
    }
  };

  // 신호 수락
  const acceptSignal = async (signalId) => {
    try {
      const resp = await api.post(`/signals/accept/${signalId}`);
      const data = resp.data; // { roomId, peer }

      setMessage(`플러팅 수락 완료! roomId=${data.roomId}`);
      setMatch({ peer: data.peer, roomId: data.roomId }); // ✅ 전역 저장

      // ✅ Firestore에 방 생성
      const roomRef = doc(db, "chatRooms", data.roomId);
      await setDoc(roomRef, {
        createdAt: serverTimestamp(),
        participants: [userId, data.peer.userId],
        peerInfo: data.peer,
        lastMessage: "",
        lastMessageAt: null,
      });
    } catch (err) {
      console.error("❌ 신호 수락 실패:", err);
      setMessage("플러팅 수락 실패");
    }
  };

  // 보낸 신호 목록
  const fetchSentSignals = async () => {
    try {
      const resp = await api.get("/signals/sent");
      setSentSignals(resp.data);
    } catch (err) {
      console.error("❌ 보낸 신호 목록 조회 실패:", err);
    }
  };

  // 받은 신호 목록
  const fetchReceivedSignals = async () => {
    try {
      const resp = await api.get("/signals/received");
      setReceivedSignals(resp.data);
    } catch (err) {
      console.error("❌ 받은 신호 목록 조회 실패:", err);
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
          {peer.typeImageUrl2 && (
            <img src={peer.typeImageUrl2} alt="type2" width={100} />
          )}
        </div>
      )}

      <h3>보낸 신호 목록</h3>
      <ul>
        {sentSignals.map((s) => (
          <li key={s.signalId}>
            대상 ID: {s.targetId} (상태: {s.status})
          </li>
        ))}
      </ul>

      <h3>받은 신호 목록</h3>
      <ul>
        {receivedSignals.map((s) => (
          <li key={s.signalId}>
            {s.fromUser.name} ({s.fromUser.department}) → 상태: {s.status}
            <button onClick={() => acceptSignal(s.signalId)}>수락하기</button>
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
