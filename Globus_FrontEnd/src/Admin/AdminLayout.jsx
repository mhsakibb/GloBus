import React, { useState } from "react";
import ReactDOM from "react-dom";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaSearch,
  FaShoppingBag,
  FaUsers,
  FaChartLine,
  FaHome,
  FaBell
} from "react-icons/fa";

import { useAuth } from "../Hooks/AuthContext";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  const getNavLinkClass = (isActive) => {
    return `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
      isActive
        ? "bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-400 border-l-4 border-indigo-500 shadow-sm"
        : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
    }`;
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-800 dark:text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-slate-900 border-r border-slate-800/60 p-6 flex flex-col transition-all duration-300 z-30 shadow-2xl md:shadow-none
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 pb-8 border-b border-slate-800/50 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="text-white font-bold text-xl">G</span>
          </div>
          <h1 className="font-bold text-2xl tracking-tight text-white">
            Glo<span className="text-indigo-400">Bus</span>
          </h1>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 space-y-2">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) => getNavLinkClass(isActive)}
          >
            <FaHome className="text-lg" /> Dashboard
          </NavLink>

          <NavLink
            to="/admin/orders"
            className={({ isActive }) => getNavLinkClass(isActive)}
          >
            <FaShoppingBag className="text-lg" /> Orders
          </NavLink>

          <NavLink
            to="/admin/products"
            className={({ isActive }) => getNavLinkClass(isActive)}
          >
            <FaChartLine className="text-lg" /> Products
          </NavLink>

          <NavLink
            to="/admin/customers"
            className={({ isActive }) => getNavLinkClass(isActive)}
          >
            <FaUsers className="text-lg" /> Customers
          </NavLink>
        </nav>

        {/* User Card inside Sidebar */}
        <div className="mt-auto pt-6 border-t border-slate-800/50">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center font-bold text-white shadow-md">
              {user?.name?.charAt(0) || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-200 truncate">{user?.name || "Admin User"}</p>
              <p className="text-xs text-slate-400 capitalize truncate">{user?.role || "Administrator"}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-20 md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 ml-0 md:ml-72 flex flex-col min-h-screen transition-all duration-300">
        {/* Top Header */}
        <header className="sticky top-0 z-10 bg-white/70 dark:bg-[#0B1120]/70 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800/60 px-6 py-4 flex justify-between items-center transition-colors duration-300">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <FaBars className="text-xl" />
            </button>
            <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent hidden sm:block">
              Admin Portal
            </h2>
          </div>

          <div className="flex items-center gap-5">
            <div className="relative group hidden md:block">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                placeholder="Search anything..."
                className="bg-slate-100 dark:bg-slate-900/50 border border-transparent dark:border-slate-700/50 rounded-full py-2 pl-10 pr-4 text-sm text-slate-700 dark:text-slate-200 w-64 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
              />
            </div>

            <button className="relative p-2 text-slate-400 hover:text-indigo-500 transition-colors">
              <FaBell className="text-xl" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-[#0B1120]"></span>
            </button>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700/50"></div>

            <button
              onClick={() => setShowLogoutModal(true)}
              className="px-4 py-2 text-sm font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Page Content Container */}
        <div className="p-6 flex-1 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
             <Outlet />
          </div>
        </div>
      </main>

      {/* Logout Modal */}
      {showLogoutModal &&
        ReactDOM.createPortal(
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100]">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 w-[90%] max-w-sm shadow-2xl transform transition-all">
              <div className="w-12 h-12 bg-rose-100 dark:bg-rose-500/20 rounded-full flex items-center justify-center mb-4">
                 <svg className="w-6 h-6 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                Sign Out
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
                Are you sure you want to sign out of your account? You will need to login again to access the admin portal.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/30 transition-all"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default AdminLayout;
