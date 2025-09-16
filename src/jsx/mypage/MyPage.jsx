import "../../css/mypage/MyPage.css";
import ResultPage from "../signup/ResultPage";
import api from "../../api/axios.js";
import useUserStore from "../../api/userStore.js";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import QuitForm from "./QuitForm.jsx"; // ✅ 추가 (경로 맞게 조정 필요)

function Matching() {
  const navigate = useNavigate();
  const clearUser = useUserStore((s) => s.clearUser);

  const [quitOpen, setQuitOpen] = useState(false); // ✅ 모달 열림 상태
  const [loading, setLoading] = useState(false);

  // 로그아웃
  const handleLogout = async () => {
    try {
      await api.post("/auth/logout"); // ✅ 서버 로그아웃 호출
    } catch (err) {
      console.error("로그아웃 실패:", err);
    } finally {
      clearUser(); // 상태 초기화
      // ✅ 로컬스토리지 정리
      localStorage.removeItem("user");
      localStorage.removeItem("user-storage");
      localStorage.removeItem("accessToken");
      navigate("/login");
    }
  };

  // 회원탈퇴
  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      await api.delete("/auth/kakao/unlink"); // ✅ 회원탈퇴 호출
      clearUser();
      // ✅ 로컬스토리지 정리
      localStorage.removeItem("user");
      localStorage.removeItem("user-storage");
      localStorage.removeItem("accessToken");
      alert("회원탈퇴가 완료되었습니다.");
      navigate("/login");
    } catch (err) {
      console.error("회원탈퇴 실패:", err);
      alert("회원탈퇴 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
      setQuitOpen(false);
    }
  };

  return (
    <div className="matching-page">
      <ResultPage hideHomeButton={true} />

      {/* 버튼 영역 */}
      <div className="account-actions">
        <button className="logout-btn" onClick={handleLogout}>
          로그아웃
        </button>
        <button className="delete-btn" onClick={() => setQuitOpen(true)}>
          회원탈퇴
        </button>
      </div>

      {/* ✅ 회원탈퇴 모달 */}
      <QuitForm
        open={quitOpen}
        onConfirm={handleDeleteAccount}
        onCancel={() => setQuitOpen(false)}
        loading={loading}
      />
    </div>
  );
}

export default Matching;
