import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../../image/loginPage/logo.svg";
import TicketLogo from "../../image/home/ticket.svg";
import CouponSheet from "./CouponSheet";         // ⬅️ 추가
import "../../css/common/Header.css";

function Header() {
  const [openCoupon, setOpenCoupon] = useState(false);

  return (
    <>
      <header>
        <Link to="/">
          <img src={Logo} alt="U and Me Logo" />
        </Link>
        <img
          src={TicketLogo}
          alt="Ticket Icon"
          onClick={() => setOpenCoupon(true)}             // ⬅️ 열기
          style={{ cursor: "pointer" }}
        />
      </header>

      <CouponSheet
        open={openCoupon}
        onClose={() => setOpenCoupon(false)}              // ⬅️ 닫기
      />
    </>
  );
}

export default Header;
