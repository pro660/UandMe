import React from "react";
import {Routes, Route} from "react-router-dom";

import Home from "./jsx/Home";
import LoginPage from "./jsx/LoginPage";

function AppRouter(){
    return(
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
        </Routes>
    );
}

export default AppRouter;