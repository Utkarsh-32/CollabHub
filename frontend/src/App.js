import React from "react";
import { Routes, Route } from "react-router-dom";
import ProjectListPage from "./ProjectListPage";
import ProjectDetailPage from "./ProjectDetailPage";
import UserProfilePage from "./UserProfilePage";
import LoginPage from "./LoginPage";
import RegistrationPage from "./RegistrationPage";

function App() {
    return (
    <Routes>
        <Route path="/" element={<ProjectListPage />} />
        <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
        <Route path="/users/:userId" element={<UserProfilePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegistrationPage />} />
    </Routes>
    );
}

export default App;