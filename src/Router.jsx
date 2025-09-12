// src/Router.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./jsx/Home";
import LoginPage from "./jsx/LoginPage";
import InfoForm from "./jsx/InfoForm";
import PostLoginGate from "./jsx/PostLoginGate";
import ProtectedRoute from "./ProtectedRoute";

export default function AppRouter() {
  return (
    <Routes>
      {/* 공개 페이지 */}
      <Route path="/login" element={<LoginPage />} />

      {/* 로그인 후 첫 분기: 회원가입 여부 판단 */}
      <Route path="/post-login" element={<PostLoginGate />} />

      {/* 회원가입(정보 입력 페이지) */}
      <Route path="/infoform" element={<InfoForm />} />

      {/* 메인 홈: 로그인 완료된 유저만 */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      {/* 그 외 경로 → 홈으로 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
