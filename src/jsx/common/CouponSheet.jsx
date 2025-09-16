import { useEffect, useRef, useState, useCallback } from "react";
import "../../css/common/CouponSheet.css";
import api from "../../api/axios"; // ✅ axios 인스턴스
import useUserStore from "../../api/userStore"; // ✅ zustand 스토어

export default function CouponSheet({ open, onClose }) {
  const sheetRef = useRef(null);

  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [code, setCode] = useState("");
  const [closing, setClosing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const startYRef = useRef(0);
  const lastYRef = useRef(0);
  const lastTRef = useRef(0);

  const isValid = code.trim().length > 0;

  const GRAB_START_ZONE = 36;
  const CLOSE_DISTANCE = 120;
  const CLOSE_VELOCITY = 0.7;

  // 닫기 요청
  const requestClose = useCallback(() => {
    if (!closing) setClosing(true);
  }, [closing]);

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
    lastYRef.current = y;
    lastTRef.current = performance.now();
    e.preventDefault();
  };

  // 터치 종료
  const onTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const dt = Math.max(1, performance.now() - lastTRef.current);
    const vy = (lastYRef.current - startYRef.current) / dt;
    if (dragY > CLOSE_DISTANCE || vy > CLOSE_VELOCITY) {
      setDragY(0);
      requestClose();
    } else {
      setDragY(0);
      sheetRef.current?.style.setProperty("--dragY", `0px`);
    }
  };

  // CSS 변수로 이동 반영
  useEffect(() => {
    sheetRef.current?.style.setProperty("--dragY", `${dragY}px`);
  }, [dragY]);

  // ESC 닫기
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") requestClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [requestClose]);

  // 애니메이션 종료 후 완전히 닫기
  const handleAnimationEnd = () => {
    if (closing) {
      setClosing(false);
      onClose?.();
    }
  };

  if (!open && !closing) return null;

  const handleChange = (e) => {
    const onlyDigits = e.target.value.replace(/\D/g, "");
    setCode(onlyDigits);
    setMessage("");
  };

  // ✅ 쿠폰 코드 제출
  const handleSubmit = async () => {
    if (!isValid || loading) return;

    try {
      setLoading(true);
      setMessage("");

      const resp = await api.post("/event/redeem", { code });
      const { matchCredits, signalCredits } = resp.data;

      // ✅ 전역 상태 업데이트
      useUserStore.getState().updateCredits({
        matchCredits,
        signalCredits,
      });

      // ✅ 성공 시 바로 닫기
      requestClose();
    } catch (err) {
      console.error("❌ 쿠폰 등록 실패:", err);
      setMessage(
        err.response?.data?.message ||
          "쿠폰 등록에 실패했습니다. 다시 시도해주세요."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`coupon-backdrop ${closing ? "closing" : ""}`}
      onClick={requestClose}
    >
      <div
        ref={sheetRef}
        className={`coupon-sheet ${dragY ? "dragging" : ""} ${
          closing ? "closing" : ""
        }`}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        role="dialog"
        aria-modal="true"
        onAnimationEnd={handleAnimationEnd}
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
          <li>
            매칭은 <b>단 두번</b>만 가능합니다.
          </li>
          <li>
            더 많은 만남을 원하신다면, 축제날 ‘멋쟁이 사자처럼’ 부스를 방문해
            음료와 함께 <b>특별한 쿠폰</b>을 받아보세요.
          </li>
        </ul>

        {message && (
          <p className="coupon-message error">{message}</p>
        )}

        <button
          className={`coupon-submit ${isValid ? "is-active" : "is-disabled"}`}
          type="button"
          onClick={handleSubmit}
          disabled={!isValid || loading}
        >
          {loading ? "확인 중..." : "확인"}
        </button>
      </div>
    </div>
  );
}
