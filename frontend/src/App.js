import React from "react";
import { Routes, Route } from "react-router-dom";
import ProjectListPage from "./ProjectListPage";
import ProjectDetailPage from "./ProjectDetailPage";

function App() {
    return (
    <Routes>
        <Route path="/" element={<ProjectListPage />}/>
        <Route path="projects/:projectId" element={<ProjectDetailPage />}/>
    </Routes>
    );
}

export default App;