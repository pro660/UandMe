import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import "../../css/common/Menu.css";

function Menu() {
  const navigate = useNavigate();
  const location = useLocation();
  const [pos, setPos] = useState(0);

  // 경로 따라 위치 업데이트
  useEffect(() => {
    if (location.pathname === "/") setPos(0);
    else if (location.pathname.startsWith("/matching")) setPos(1);
    else if (location.pathname.startsWith("/chat")) setPos(2);
    else if (location.pathname.startsWith("/mypage")) setPos(3);
  }, [location.pathname]);

  const handleClick = (idx) => {
    switch (idx) {
      case 0: navigate("/"); break;
      case 1: navigate("/matching"); break;
      case 2: navigate("/chat"); break;
      case 3: navigate("/mypage"); break;
      default: break;
    }
  };

  return (
    <div className="menu menu-fixed">
      <div className="menu-buttons">
        <div className="glass-radio-group" style={{ "--count": 4 }}>
          <button className={pos === 0 ? "active" : ""} onClick={() => handleClick(0)}>홈</button>
          <button className={pos === 1 ? "active" : ""} onClick={() => handleClick(1)}>매칭</button>
          <button className={pos === 2 ? "active" : ""} onClick={() => handleClick(2)}>채팅창</button>
          <button className={pos === 3 ? "active" : ""} onClick={() => handleClick(3)}>마이페이지</button>

          {/* 글라이더 애니메이션 */}
          <motion.span
            className="glass-glider"
            aria-hidden="true"
            animate={{ x: `${pos * 100}%` }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
          />
        </div>
      </div>
    </div>
  );
}

export default Menu;
