import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import PageTransitionsIOS from "./jsx/common/PageTransitionsIOS";

import ProtectedRoute from "./ProtectedRoute";
import ChatRoomGuard from "./jsx/chat/ChatRoomGuard";

import Header from "./jsx/common/Header";
import Menu from "./jsx/common/Menu2";

import Home from "./jsx/home/Home";
import ChatList from "./jsx/chat/ChatList";
import MatchingEntry from "./jsx/matching/MatchingEntry.jsx";
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
  const hiddenPaths = ["/login", "/infoform", "/result", "/qpage"];
  const shouldHide =
    hiddenPaths.includes(location.pathname) ||
    location.pathname.startsWith("/chat/");

  // 전환을 끄고 싶은 경로(예: 로딩, 풀스크린 뷰 등)
  const noAnimate = location.pathname.startsWith("/loading");

  // 채팅 룸에서 스와이프-백 비활성화(입력/제스처 충돌 방지)
  const swipeBack = !location.pathname.startsWith("/chat");

  return (
    <>
      {!shouldHide && <Header />}

      {/* 본문만 전환되게 컨테이너 추가 */}
      <div
        className="content-wrap"
        style={{ position: "relative", minHeight: "100%" }}
      >
        {noAnimate ? (
          children
        ) : (
          <PageTransitionsIOS swipeBack={swipeBack}>
            {children}
          </PageTransitionsIOS>
        )}
      </div>

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
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/matching"
            element={
              <ProtectedRoute>
                <MatchingEntry />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mypage"
            element={
              <ProtectedRoute>
                <MyPage />
              </ProtectedRoute>
            }
          />

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
