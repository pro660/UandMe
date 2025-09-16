// src/components/common/Header.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Logo from "../../image/loginPage/logo.svg";
import TicketLogo from "../../image/home/ticket.svg";
import CouponSheet from "./CouponSheet";
import "../../css/common/Header.css";

function Header() {
  const [openCoupon, setOpenCoupon] = useState(false);

  // ✅ 남은 횟수 상태
  const [matchCredits, setMatchCredits] = useState(0);
  const [signalCredits, setSignalCredits] = useState(0);
  const [nickname, setNickname] = useState(""); // ✅ 이름 상태 추가

  // ✅ 로컬스토리지에서 값 불러오기
  useEffect(() => {
    const storedMatch = localStorage.getItem("matchCredits");
    const storedSignal = localStorage.getItem("signalCredits");
    const storedName = localStorage.getItem("name");

    setMatchCredits(storedMatch ? parseInt(storedMatch, 10) : 0);
    setSignalCredits(storedSignal ? parseInt(storedSignal, 10) : 0);
    setNickname(storedName || ""); // ✅ 값 없으면 빈 문자열
  }, []);

  return (
    <>
      <header className="header">
        <Link to="/" className="header-logo">
          <img src={Logo} alt="U and Me Logo" />
        </Link>

        <div className="header-ticket-area">
          {/* ✅ 남은 횟수 표시 */}
          <div className="ticket-count-box">
            <p className="ticket-label">
              {nickname ? `${nickname}님 남은 횟수` : "남은 횟수"}
            </p>
            <p className="ticket-values">
              매칭:<span className="highlight">{matchCredits}회</span>
              <span style={{ marginRight: "0.1rem" }} /> {/* 간격 */}
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
