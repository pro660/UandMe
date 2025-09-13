import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from "./jsx/common/Header";
import Menu from "./jsx/common/Menu";

import Home from "./jsx/Home";
import ChatList from "./jsx/chat/ChatList";
import Matching from "./jsx/matching/Matching";
import MyPage from "./jsx/mypage/MyPage";

import LoginPage from "./jsx/LoginPage";
import InfoForm from "./jsx/InfoForm";
import PostLoginGate from "./jsx/PostLoginGate";

function AppRouter() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/chat" element={<ChatList />} />
        <Route path="/matching" element={<Matching />} />
        <Route path="/mypage" element={<MyPage />} />

              {/* 공개 페이지 */}
      <Route path="/login" element={<LoginPage />} />

      {/* 로그인 후 첫 분기: 회원가입 여부 판단 */}
      <Route path="/post-login" element={<PostLoginGate />} />

      {/* 회원가입(정보 입력 페이지) */}
      <Route path="/infoform" element={<InfoForm />} />
      </Routes>
      <Menu />
    </BrowserRouter>
  );
}
export default AppRouter;