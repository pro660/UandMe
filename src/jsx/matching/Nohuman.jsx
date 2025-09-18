import "../../css/matching/Nohuman.css"

import WarningImg from "../../image/matching/warning.svg"

function Nohuman(){
    return(
        <div className="nohuman-page">
            <div className="center">
                <img src={WarningImg} alt="느낌표 이미지" className="WarnImg"/>
                <p>서비스에 등록된 사람이 없어요.</p>
            </div>
        </div>
    );
}

export default Nohuman;