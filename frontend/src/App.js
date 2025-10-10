import React from "react";
import { Routes, Route } from "react-router-dom";
import ProjectListPage from "./pages/ProjectListPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import UserProfilePage from "./pages/UserProfilePage";
import LoginPage from "./pages/LoginPage";
import RegistrationPage from "./pages/RegistrationPage"
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardPage from "./pages/DashboardPage";
import CreateProjectPage from "./pages/CreateProjectPage";
import EditProfilePage from "./pages/EditProfilePage";
import EditProjectPage from "./pages/EditProjectPage";
import GitHubCallback from "./pages/GitHubCallback";

function App() {
    return (
    <Routes>
        <Route path="/" element={<ProjectListPage />} />
        <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
        <Route path="/users/:userId" element={<UserProfilePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/projects/new" element={<ProtectedRoute><CreateProjectPage /></ProtectedRoute>} />
        <Route path="/profile/edit" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
        <Route path="/projects/:projectId/edit" element={<ProtectedRoute><EditProjectPage /></ProtectedRoute>} />
        <Route path="/social/github/callback/" element={<GitHubCallback />} />
    </Routes>
    );
}

export default App;