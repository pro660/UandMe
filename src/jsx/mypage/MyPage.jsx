import "../../css/mypage/MyPage.css";
import ResultPage from "../signup/ResultPage";
import api from "../../api/axios.js";
import useUserStore from "../../api/userStore.js";
import { useNavigate } from "react-router-dom";

function Matching() {
  const navigate = useNavigate();
  const clearUser = useUserStore((s) => s.clearUser);

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
    if (!window.confirm("정말 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;

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
        <button className="delete-btn" onClick={handleDeleteAccount}>
          회원탈퇴
        </button>
      </div>
    </div>
  );
}

export default Matching;
