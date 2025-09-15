import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";

import Header from "./jsx/common/Header";
import Menu from "./jsx/common/Menu";

import Home from "./jsx/home/Home";
import ChatList from "./jsx/chat/ChatList";
import Matching from "./jsx/matching/Matching";
import MyPage from "./jsx/mypage/MyPage";

import LoginPage from "./jsx/signup/LoginPage";
import InfoForm from "./jsx/signup/InfoForm";
import QPage from "./jsx/signup/QPage";
import ResultPage from "./jsx/signup/ResultPage";

// 레이아웃 컴포넌트
function Layout({ children }) {
  const location = useLocation();
  const hiddenPaths = ["/login", "/infoform", "/post-login", "/result", "/qpage"];
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

          {/* 회원가입 관련 페이지 - 보호 */}
          <Route
            path="/infoform"
            element={
              <ProtectedRoute>
                <InfoForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/qpage"
            element={
              <ProtectedRoute>
                <QPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/result"
            element={
              <ProtectedRoute>
                <ResultPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default AppRouter;
