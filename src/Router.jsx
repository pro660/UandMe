import React from "react";
import {Routes, Route} from "react-router-dom";

import Home from "./jsx/Home";
import LoginPage from "./jsx/LoginPage";
import InfoFormPage from "./jsx/InfoForm";
import ProtectedRoute from "./ProtectedRoute";

function AppRouter(){
    return(
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/infoform" element={<InfoFormPage />} /> {/* ==추후 ProtectedRoute.jsx로 페이지 컴포넌트 감싸주기== */}
        </Routes>
    );
}

export default AppRouter;