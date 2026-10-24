"use client";

import React, { useState } from "react";
import {
  Search,
  Bell,
  Sun,
  Moon,
  Command,
  User,
  Shield,
  LogOut,
  Sparkles,
  ChevronDown,
  CheckCircle,
} from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { PillBadge } from "@/components/ui/PillBadge";
import { PillButton } from "@/components/ui/PillButton";

interface HeaderProps {
  user: any;
  onRoleSwitch: (roleId: string) => void;
  onOpenCommandPalette: () => void;
  onToggleNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onRoleSwitch,
  onOpenCommandPalette,
  onToggleNotifications,
}) => {
  const { theme, toggleTheme } = useTheme();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const availableRoles = [
    { id: "role_admin", name: "Super Admin", badge: "Admin" },
    { id: "role_principal", name: "Ban Giám Hiệu", badge: "BGH" },
    { id: "role_teacher", name: "Giáo viên", badge: "GV" },
    { id: "role_student", name: "Học sinh", badge: "HS" },
    { id: "role_parent", name: "Phụ huynh", badge: "PH" },
  ];

  const currentRole = availableRoles.find((r) => r.id === user?.roleId) || availableRoles[0];

  const handleLogout = async () => {
    await fetch("/api/auth/session", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-slate-200/80 dark:border-slate-800/80 px-4 md:px-6 flex items-center justify-between transition-all">
      {/* Search Bar / Command Palette Trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-3 px-4 py-2 rounded-full bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-blue-500/50 hover:bg-white dark:hover:bg-slate-800 transition-all text-xs md:text-sm w-48 md:w-72"
        >
          <Search size={16} className="text-slate-400 shrink-0" />
          <span className="truncate">Tìm học sinh, lớp, giáo viên...</span>
          <kbd className="hidden md:inline-flex items-center gap-0.5 ml-auto px-2 py-0.5 text-[10px] font-semibold text-slate-400 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 shadow-2xs">
            <Command size={10} /> K
          </kbd>
        </button>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Role Switcher Pill */}
        <div className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100/80 transition-colors"
            title="Chuyển vai trò thử nghiệm"
          >
            <Shield size={14} />
            <span className="hidden sm:inline">Vai trò:</span>
            <span>{currentRole.name}</span>
            <ChevronDown size={12} />
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-xl p-2 z-50">
              <p className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Chuyển vai trò demo
              </p>
              {availableRoles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => {
                    onRoleSwitch(role.id);
                    setShowRoleDropdown(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <span className="text-slate-700 dark:text-slate-200">{role.name}</span>
                  {user?.roleId === role.id && <CheckCircle size={14} className="text-blue-600 dark:text-blue-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          title={theme === "dark" ? "Chuyển giao diện sáng" : "Chuyển giao diện tối"}
        >
          {theme === "dark" ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
        </button>

        {/* Notification Bell */}
        <button
          onClick={onToggleNotifications}
          className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          title="Thông báo"
        >
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
        </button>

        {/* User Profile Pill */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2 p-1 pl-2 pr-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800/60 transition-all"
          >
            <img
              src={user?.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=User"}
              alt={user?.fullName || "User"}
              className="w-7 h-7 rounded-full bg-blue-100 shrink-0"
            />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[100px] truncate hidden sm:inline">
              {user?.fullName || "Người dùng"}
            </span>
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-xl p-3 z-50">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <img
                  src={user?.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=User"}
                  alt="User"
                  className="w-10 h-10 rounded-full bg-blue-100"
                />
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                    {user?.fullName}
                  </span>
                  <span className="text-xs text-slate-500 truncate">{user?.email}</span>
                </div>
              </div>
              <div className="pt-2 space-y-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  <LogOut size={14} />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
