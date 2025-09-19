import "../../css/mypage/MyPage.css";
import ResultPage from "../signup/ResultPage";
import api from "../../api/axios.js";
import useUserStore from "../../api/userStore.js";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import QuitForm from "./QuitForm.jsx";
import { AnimatePresence, motion } from "framer-motion"; // ✅ 추가
import Loader from "../common/Loader"; // ✅ 추가

function MyPage() {
  const navigate = useNavigate();
  const clearUser = useUserStore((s) => s.clearUser);

  const [quitOpen, setQuitOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ 마이페이지 진입 시 준비 로딩
  const [pageLoading, setPageLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 300); // 필요시 API 대체
    return () => clearTimeout(timer);
  }, []);

  // 로그아웃
  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("로그아웃 실패:", err);
    } finally {
      clearUser();
      localStorage.removeItem("user");
      localStorage.removeItem("user-storage");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("matching-storage"); // ✅ 추가
      navigate("/login");
    }
  };

  // 회원탈퇴
  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      await api.delete("/auth/kakao/unlink");
      clearUser();
      localStorage.removeItem("user");
      localStorage.removeItem("user-storage");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("matching-storage"); // ✅ 추가

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

  const fade = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.35 } },
    exit: { opacity: 0, transition: { duration: 0.35 } },
  };

  return (
    <div className="mypage">
      <AnimatePresence mode="sync">
        {!pageLoading && (
          <motion.div key="mypage" {...fade}>
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

            {/* 회원탈퇴 모달 */}
            <QuitForm
              open={quitOpen}
              onConfirm={handleDeleteAccount}
              onCancel={() => setQuitOpen(false)}
              loading={loading}
            />

            <div className="tabbar-spacer" aria-hidden="true" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ 오버레이 로딩 */}
      {pageLoading && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 2000,
          }}
        >
          <Loader />
        </div>
      )}
    </div>
  );
}

export default MyPage;
