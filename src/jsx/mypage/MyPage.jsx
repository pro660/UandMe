import "../../css/mypage/MyPage.css";
import ResultPage from "../signup/ResultPage";

function Matching() {
  return (
    <div className="matching-page">
      <ResultPage hideHomeButton={true} />
    </div>
  );
}

export default Matching;
