import React, { useState } from "react";
import "../../css/home/DrinkMenu.css";

// 이미지 import (실제 경로 맞게 수정!)
import lovePotionImg from "../../image/home/icetea.svg";
import americanoImg from "../../image/home/icetea.svg";
import icedTeaImg from "../../image/home/icetea.svg";
import milkisImg from "../../image/home/icetea.svg";

export default function DrinkMenu() {
  // 상수 데이터
  const DRINKS = [
    {
      id: "lovepotion",
      name: "러브포션",
      price: 2000,
      desc: "두근거림 충전 완료! 오직 멋사 부스에서만 만날 수 있는 마법의 음료예요.",
      image: lovePotionImg,
    },
    {
      id: "americano",
      name: "아이스 아메리카노",
      price: 2000,
      desc: "깔끔하고 시원한 기본템! 언제나 인기 있는 선택이에요.",
      image: americanoImg,
    },
    {
      id: "icedtea",
      name: "아이스티",
      price: 1500,
      desc: "상큼 달콤한 시원함! 누구나 좋아하는 음료예요.",
      image: icedTeaImg,
    },
    {
      id: "milkis",
      name: "밀키스",
      price: 2000,
      desc: "톡 쏘는 청량감에 부드러운 맛까지, 남녀노소 인기 만점!",
      image: milkisImg,
    },
  ];

  const [selected, setSelected] = useState(DRINKS[0]); // 기본 러브포션

  return (
    <div className="drink-menu-container">
      <h2 className="drink-title">멋사만의 음료를 만나보세요</h2>

      {/* 상세 정보 영역 */}
      <div className="drink-detail">
        <img src={selected.image} alt={selected.name} className="drink-image" />
        <div className="drink-info">
          <h3>{selected.name}</h3>
          <span className="drink-price">{selected.price.toLocaleString()} ₩</span>
          <p style={{fontSize: "0.7rem"}}>{selected.desc}</p>
        </div>
      </div>

      <hr />

      {/* 메뉴 리스트 */}
      <div className="drink-list">
        {DRINKS.map((drink) => (
          <div
            key={drink.id}
            className={`drink-item ${selected.id === drink.id ? "active" : ""}`}
            onClick={() => setSelected(drink)}
          >
            <span>{drink.name}</span>
            <span>{drink.price.toLocaleString()} ₩</span>
          </div>
        ))}
      </div>
    </div>
  );
}
