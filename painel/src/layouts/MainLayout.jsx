import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import "./MainLayout.css";

export default function MainLayout() {
  return (
    <div className="layout">

      <Sidebar />

      <div className="content">

        <TopBar />

        <Outlet />

      </div>

    </div>
  );
}