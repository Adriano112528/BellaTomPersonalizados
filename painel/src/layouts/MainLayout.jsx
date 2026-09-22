import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

import "./MainLayout.css";

export default function MainLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="layout">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((prev) => !prev)}
      />

      <div className={`content ${sidebarCollapsed ? "content-collapsed" : ""}`}>
        <TopBar />
        <Outlet />
      </div>
    </div>
  );
}