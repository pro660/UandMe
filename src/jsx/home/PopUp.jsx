import React, { useEffect } from "react";
import "../../css/home/PopUp.css";

export default function PopUp({ open, onClose }) {
  // 배경 스크롤 잠금
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = prev);
  }, [open]);

  // ESC 로 닫기
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  const stop = (e) => e.stopPropagation();

  return (
    <div className="popup-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="popup" onClick={stop}>
        <div className="popup-header">
          <button className="popup-close" aria-label="팝업 닫기" onClick={onClose}>×</button>
          <h2 className="popup-headline">개인정보 처리방침</h2>
        </div>

        <div className="popup-content policy">
          {/* 인트로 */}
          <section className="intro">
            <h3 className="intro-title">‘너랑나랑’이 알려드리는 개인정보 이야기</h3>
            <p>
              안녕하세요! ‘너랑나랑’ 웹 서비스를 제작한 “한서대-멋쟁이사자처럼” 입니다.
              저희는 회원님의 소중한 만남을 응원하는 만큼, 회원님의 개인정보 또한 무엇보다
              <b className="hl"> 소중하게 생각하고 안전하게 지킬 것을 약속드립니다.</b>
            </p>
            <p>회원님의 정보가 어떻게 사용되는지 투명하고 알기 쉽게 설명해 드릴게요.</p>
          </section>

          {/* ⭐ 이미지처럼 구성한 섹션 */}
          <section>
            <h4 className="q">Q. ‘너랑나랑’은 어떤 정보를 수집하나요?</h4>
            <p className="lead">
              저희는 최고의 매칭 경험을 제공하기 위해 꼭 필요한 정보만을 요청하고 있어요.
            </p>

            <ul className="heart-list">
              <li>
                <span className="label">서비스 가입과 프로필 작성</span>을 위해 필요해요.<br/>
                간편 로그인 정보(카카오 계정)를 통해 <b>이메일, 닉네임, 프로필 사진</b>을
                가져와 가입을 도와드려요.
              </li>
              <li>
                <span className="label">나만의 프로필 정보</span>: 회원님을 잘 나타낼 수 있는
                <b> 닉네임, 나이(학번), 성별, 학과</b>를 입력받아요.
              </li>
              <li>
                <span className="label">매력 어필 정보</span>: ‘이상형 테스트’의 답변 내용이나,
                <b> 자기소개</b>처럼 성향과 가치관을 보여줄 수 있는 정보를 받아요.
              </li>
              <li>더 나은 서비스를 위해 <b>자동으로 수집되기도 해요</b></li>
              <li>
                <span className="label">서비스 이용 기록</span>: 어떤 프로필에 관심을 보였는지, 누구와 매칭되었는지 등의
                <b> 활동 기록</b>이 더 좋은 추천을 위해 활용돼요.
              </li>
              <li>
                <span className="label">기기 정보</span>: 어떤 스마트폰 환경에서 ‘너랑나랑’을 이용하는지 파악해서
                <b> 오류를 해결하고 서비스를 최적화</b>하는 데 사용돼요.
              </li>
            </ul>
          </section>

          {/* 나머지 섹션 */}
          <section className="other">
            <h4 className="q">Q. 수집한 정보는 어디에 사용되나요?</h4>
            <p>
              회원님의 정보는 ‘너랑나랑’의 핵심 기능,<br/> 바로
              <b className="hl"> ‘좋은 사람 찾기’</b>를 위해 가장 많이 사용돼요!
            </p>
            <p>
              회원님에게 딱 맞는 상대를 찾아주기 위해 
              입력해주신 프로필과 ‘이상형 테스트’ 결과를 종합적으로 분석해서,
              <b> 회원님과 잘 맞을 것 같은 사람</b>을 정성껏 추천해 드려요.
            </p>
            <p>
              안전하고 즐거운 소통을 돕기 위해 부적절한 활동이나 약관을 위반하는 사용자를 막고, 
              <p className="important">모든 회원이 안심하고 서비스를 이용할 수 있는 환경</p>을 만드는 데 사용돼요.
              문제가 발생했을 때 신속히 도와드리는 것도 물론이고요.
            </p>
            <p>'너랑나랑' 서비스를 계속 발전시키기 위해 어떤 기능을 가장 좋아하고, 어떤 점을 불편해하는지 통계적으로 분석해서 서비스를 개선하고 새로운 기능을 만드는 데 소중하게 사용된답니다.</p>
          </section>

          <section className="other">
            <h4 className="q">Q. 제 정보는 안전하게 보관되나요?</h4>
            <p>
              네, 물론입니다. <br/>회원님의 정보는 서비스를 이용하시는 동안 암호화 기술 등을 통해
              <b className="pinktext"> 외부의 접근으로부터 안전하게 보호</b>됩니다. 또한 회원탈퇴를 하시는 즉시, 법령에 따라 보관해야 하는 일부 정보를 제외하고 
             <b> 모든 정보는 지체 없이 파기</b>되니 안심하세요.
            </p>
          </section>

          <section className="other">
            <h4 className="q">Q. 제 정보를 직접 관리할 수 있나요?</h4>
            <p>
              <p className="pinkptext">회원가입 시 정보는 고정값으로 받기에 수정하기 어렵습니다.</p> 그리하여 정보 입력 시 신중하게 입력 부탁드립니다. 또한 로그인을 카카오톡 ID를 통해 승인을 받기에 회원 탈퇴 시 기존에 등록된 정보로 다시 로그인 되오니 주의하시길 바랍니다.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
