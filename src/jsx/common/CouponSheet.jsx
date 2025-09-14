import { useEffect, useRef, useState } from "react";
import "../../css/common/CouponSheet.css";

export default function CouponSheet({ open, onClose }) {
  const sheetRef = useRef(null);

  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [code, setCode] = useState("");

  const startYRef = useRef(0);
  const lastYRef = useRef(0);
  const lastTRef = useRef(0);

  const isValid = code.trim().length > 0;

  const GRAB_START_ZONE = 36;   // 드래그 시작 가능한 영역 높이(px)
  const CLOSE_DISTANCE = 120;   // 일정 거리 넘게 내리면 닫기
  const CLOSE_VELOCITY = 0.7;   // px/ms 초과 속도면 닫기

  // 스크롤 잠금
  useEffect(() => {
    if (open) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => (document.body.style.overflow = original);
    }
  }, [open]);

  // 터치 시작
  const onTouchStart = (e) => {
    const sheet = sheetRef.current;
    if (!sheet) return;

    const rect = sheet.getBoundingClientRect();
    const touchY = e.touches[0].clientY;

    // ⬇️ 그랩바 영역에서만 드래그 시작
    if (touchY - rect.top > GRAB_START_ZONE) return;

    setIsDragging(true);
    startYRef.current = touchY;
    lastYRef.current = touchY;
    lastTRef.current = performance.now();
  };

  // 터치 이동
  const onTouchMove = (e) => {
    if (!isDragging) return;
    const y = e.touches[0].clientY;
    const dy = Math.max(0, y - startYRef.current);
    setDragY(dy);

    // 속도 계산용
    lastYRef.current = y;
    lastTRef.current = performance.now();

    e.preventDefault(); // 스크롤 충돌 방지
  };

  // 터치 종료
  const onTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const dt = Math.max(1, performance.now() - lastTRef.current);
    const vy = (lastYRef.current - startYRef.current) / dt; // px/ms

    if (dragY > CLOSE_DISTANCE || vy > CLOSE_VELOCITY) {
      setDragY(0);
      onClose?.();
    } else {
      setDragY(0);
      sheetRef.current?.style.setProperty("--dragY", `0px`);
    }
  };

  // CSS 변수로 이동 반영
  useEffect(() => {
    sheetRef.current?.style.setProperty("--dragY", `${dragY}px`);
  }, [dragY]);

  // ESC 키 닫기
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!open) return null;

  const handleChange = (e) => {
    const onlyDigits = e.target.value.replace(/\D/g, "");
    setCode(onlyDigits);
  };

  const handleSubmit = () => {
    if (!isValid) return;
    alert(`입력된 코드: ${code}`);
  };

  return (
    <div className="coupon-backdrop" onClick={onClose}>
      <div
        ref={sheetRef}
        className={`coupon-sheet ${dragY ? "dragging" : ""}`}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        role="dialog"
        aria-modal="true"
      >
        <div className="coupon-grabber" aria-hidden />
        <h2 className="coupon-title">쿠폰 등록하기</h2>

        <label className="coupon-input-wrap">
          <input
            className="coupon-input"
            type="text"
            placeholder="인증번호 입력하기"
            inputMode="numeric"
            value={code}
            onChange={handleChange}
            maxLength={12}
          />
        </label>

        <ul className="coupon-bullets">
          <li>매칭은 <b>단 두번</b>만 가능합니다.</li>
          <li>
            더 많은 만남을 원하신다면, 축제날 ‘멋쟁이 사자처럼’ 부스를 방문해
            음료와 함께 <b>특별한 쿠폰</b>을 받아보세요.
          </li>
        </ul>

        <button
          className={`coupon-submit ${isValid ? "is-active" : "is-disabled"}`}
          type="button"
          onClick={handleSubmit}
          disabled={!isValid}
        >
          확인
        </button>
      </div>
    </div>
  );
}
