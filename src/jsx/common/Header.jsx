import { Link } from "react-router-dom";
import Logo from "../../image/loginPage/logo.svg";
import TicketLogo from "../../image/home/ticket.svg";
import "../../css/common/Header.css";

function Header() {
    return (
        <header>
            <Link to="/">
                <img src={Logo} alt="U and Me Logo" />
            </Link>
            <img src={TicketLogo} alt="Ticket Icon" />
        </header>
    );
}

export default Header;
