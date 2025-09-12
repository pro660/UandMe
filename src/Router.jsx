import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from "./jsx/common/Header";
import Menu from "./jsx/common/Menu";

import Home from "./jsx/Home";
import ChatList from "./jsx/chat/ChatList";
import Matching from "./jsx/matching/Matching";
import MyPage from "./jsx/mypage/MyPage";
import LoginPage from "./jsx/loginPage";

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
      </Routes>
      <Menu />
    </BrowserRouter>
  );
}

export default AppRouter;
