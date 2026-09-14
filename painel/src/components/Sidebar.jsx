import {
  LayoutDashboard,
  Globe,
  ShoppingCart,
  Users,
  Package,
  Boxes,
  Wallet,
  BarChart3,
  Sparkles,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import { useState } from "react";

import "./Sidebar.css";

export default function Sidebar() {

  const [collapsed, setCollapsed] = useState(false);

  const menus = [

    {
      icon: <LayoutDashboard size={20} />,
      label: "Dashboard",
      path: "/",
    },

    {
      icon: <Globe size={20} />,
      label: "Editor do Site",
      path: "/editor",
    },

    {
      icon: <ShoppingCart size={20} />,
      label: "Pedidos",
      path: "/pedidos",
    },

    {
      icon: <Users size={20} />,
      label: "Clientes",
      path: "/clientes",
    },

    {
      icon: <Package size={20} />,
      label: "Produtos",
      path: "/produtos",
    },

    {
      icon: <Boxes size={20} />,
      label: "Estoque",
      path: "/estoque",
    },

    {
      icon: <Wallet size={20} />,
      label: "Financeiro",
      path: "/financeiro",
    },

    {
      icon: <BarChart3 size={20} />,
      label: "Relatórios",
      path: "/relatorios",
    },

    {
      icon: <Sparkles size={20} />,
      label: "Bella IA",
      path: "/bellaia",
    },

    {
      icon: <Settings size={20} />,
      label: "Configurações",
      path: "/configuracoes",
    }

  ];

  return (

    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>

      <div>

        <div className="sidebar-top">

          <div className="logo">

            <div className="logo-circle">
              BT
            </div>

            {!collapsed && (

              <div>

                <h2>Bella Tom</h2>

                <small>Painel Master</small>

              </div>

            )}

          </div>

          <button
            className="collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
          >

            {collapsed ? (
              <ChevronRight size={18} />
            ) : (
              <ChevronLeft size={18} />
            )}

          </button>

        </div>

        <nav className="sidebar-menu">

          {menus.map((item) => (

            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                isActive ? "menu-item active" : "menu-item"
              }
            >

              <span className="icon">
                {item.icon}
              </span>

              {!collapsed && (
                <span>{item.label}</span>
              )}

            </NavLink>

          ))}

        </nav>

      </div>

      {!collapsed && (

        <div className="sidebar-footer">

          <div className="footer-card">

            <strong>Bella Tom ERP</strong>

            <small>Versão Premium 1.0</small>

          </div>

        </div>

      )}

    </aside>

  );

}