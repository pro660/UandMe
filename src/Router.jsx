import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Header from "./jsx/common/Header";
import Menu from "./jsx/common/Menu";

import Home from "./jsx/home/Home";
import ChatList from "./jsx/chat/ChatList";
import Matching from "./jsx/matching/Matching";
import MyPage from "./jsx/mypage/MyPage";

import LoginPage from "./jsx/loginPage";
import InfoForm from "./jsx/InfoForm";

// 레이아웃 컴포넌트
function Layout({ children }) {
  const location = useLocation();
  // 숨기고 싶은 경로들
  const hiddenPaths = ["/login", "/infoform", "/post-login"];

  const shouldHide = hiddenPaths.includes(location.pathname);

  return (
    <>
      {!shouldHide && <Header />}
      {children}
      {!shouldHide && <Menu />}
    </>
  );
}

function AppRouter() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/chat" element={<ChatList />} />
          <Route path="/matching" element={<Matching />} />
          <Route path="/mypage" element={<MyPage />} />


          {/* 회원가입(정보 입력 페이지) */}
          <Route path="/infoform" element={<InfoForm />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default AppRouter;
