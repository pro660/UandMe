// src/components/common/Header.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../../image/loginPage/logo.svg";
import TicketLogo from "../../image/home/ticket.svg";
import CouponSheet from "./CouponSheet";
import useUserStore from "../../api/userStore.js";   // ✅ zustand 스토어
import "../../css/common/Header.css";

function Header() {
  const [openCoupon, setOpenCoupon] = useState(false);

  // ✅ zustand에서 user 가져오기
  const user = useUserStore((s) => s.user);

  // ✅ 필요한 값 추출
  const matchCredits = user?.matchCredits ?? 0;
  const signalCredits = user?.signalCredits ?? 0;
  const nickname = user?.name || user?.nickname || "";

  return (
    <>
      <header className="header">
        <Link to="/" className="header-logo">
          <img src={Logo} alt="U and Me Logo" />
        </Link>

        <div className="header-ticket-area">
          {/* 남은 횟수 표시 */}
          <div className="ticket-count-box">
            <p className="ticket-label">
              {nickname ? `${nickname}님 남은 횟수` : "남은 횟수"}
            </p>
            <p className="ticket-values">
              매칭:<span className="highlight">{matchCredits}회</span>
              <span style={{ marginRight: "0.1rem" }} />
              플러팅:<span className="highlight">{signalCredits}회</span>
            </p>
          </div>

          {/* 티켓 아이콘 */}
          <img
            src={TicketLogo}
            alt="Ticket Icon"
            onClick={() => setOpenCoupon(true)}
            style={{ cursor: "pointer" }}
          />
        </div>
      </header>

      <CouponSheet open={openCoupon} onClose={() => setOpenCoupon(false)} />
    </>
  );
}

export default Header;
