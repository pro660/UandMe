import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import ProtectedRoute from "./api/ProtectedRoute";

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

function Layout({ children }) {
  const location = useLocation();
  const hiddenPaths = ["/login", "/infoform", "/qpage", "/result"];
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
    <Layout>
      <Routes>
        {/* 보호된 경로 */}
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
              <Matching />
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

        {/* 공개 경로 */}
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Layout>
  );
}

export default AppRouter;
