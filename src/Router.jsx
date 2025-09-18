import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import ChatRoomGuard from "./jsx/chat/ChatRoomGuard";

import Header from "./jsx/common/Header";
import Menu from "./jsx/common/Menu2";

import Home from "./jsx/home/Home";
import ChatList from "./jsx/chat/ChatList";
import Matching from "./jsx/matching/Matching";
import MyPage from "./jsx/mypage/MyPage";

import LoginPage from "./jsx/signup/LoginPage";
import InfoForm from "./jsx/signup/InfoForm";
import QPage from "./jsx/signup/QPage";
import ResultPage from "./jsx/signup/ResultPage";

import Loader from "./jsx/common/Loader";
import ChatRoom from "./jsx/chat/ChatRoom";

// 레이아웃 컴포넌트
function Layout({ children }) {
  const location = useLocation();
  const hiddenPaths = ["/login", "/infoform", "/result", "/qpage", "/chat/:roomId"];
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
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              // <ProtectedRoute>
              <Home />
              /* </ProtectedRoute> */
            }
          />
          <Route path="/chat" element={<ChatList />} />
          <Route path="/matching" element={<Matching />} />
          <Route path="/mypage" element={<MyPage />} />

          {/* 회원가입(정보 입력 페이지) */}
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
          <Route path="/loading" element={<Loader />} />

          {/* ✅ 채팅방 라우트: URL에서 roomId 추출 + 현재 로그인 유저 ID 전달 */}
          <Route
            path="/chat/:roomId"
            element={
              <ChatRoomGuard>
                <ChatRoom />
              </ChatRoomGuard>
            }
          />

        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default AppRouter;
