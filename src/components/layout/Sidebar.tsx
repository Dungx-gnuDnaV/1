"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CalendarCheck,
  Award,
  BookOpen,
  Calendar,
  Bell,
  Settings,
  Bot,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PillBadge } from "@/components/ui/PillBadge";

interface SidebarProps {
  userRole?: string;
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ userRole = "role_admin", isOpen, onToggle }) => {
  const pathname = usePathname();

  const menuGroups = [
    {
      title: "TỔNG QUAN",
      items: [
        { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { title: "AI Trợ lý Trường học", href: "/ai-assistant", icon: Bot, badge: "AI" },
      ],
    },
    {
      title: "QUẢN LÝ DỮ LIỆU",
      items: [
        { title: "Quản lý Học sinh", href: "/students", icon: GraduationCap },
        { title: "Lớp học & Giáo viên", href: "/classes", icon: Users },
        { title: "Điểm danh Thông minh", href: "/attendance", icon: CalendarCheck },
        { title: "Điểm số & Học tập", href: "/grades", icon: BookOpen },
      ],
    },
    {
      title: "RÈN LUYỆN & LỊCH",
      items: [
        { title: "Thi đua & Khen thưởng", href: "/conduct", icon: Award },
        { title: "Thời khóa biểu & Lịch", href: "/timetable", icon: Calendar },
        { title: "Thông báo & Tin tức", href: "/notifications", icon: Bell },
      ],
    },
    {
      title: "HỆ THỐNG",
      items: [
        { title: "Cấu hình & Nhật ký", href: "/settings", icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out border-r backdrop-blur-xl",
        "bg-white/80 dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800/80 shadow-lg shadow-slate-100/50 dark:shadow-none",
        isOpen ? "w-64" : "w-20"
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200/60 dark:border-slate-800/60">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-blue-500/20 shrink-0">
            S
          </div>
          {isOpen && (
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                Smart SMS
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wider uppercase">
                Edu OS v2.5
              </span>
            </div>
          )}
        </Link>
        <button
          onClick={onToggle}
          className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          title={isOpen ? "Thu gọn menu" : "Mở rộng menu"}
        >
          {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="overflow-y-auto h-[calc(100vh-4rem)] p-3 space-y-6">
        {menuGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {isOpen && (
              <p className="px-3 text-[11px] font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase mb-2">
                {group.title}
              </p>
            )}
            {group.items.map((item, iIdx) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
              return (
                <Link
                  key={iIdx}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-2xl font-medium text-sm transition-all duration-200 group relative",
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100"
                  )}
                  title={!isOpen ? item.title : undefined}
                >
                  <Icon size={20} className={cn("shrink-0", isActive ? "text-white" : "group-hover:scale-110 transition-transform")} />
                  {isOpen && <span className="truncate">{item.title}</span>}
                  {isOpen && item.badge && (
                    <span className="ml-auto">
                      <PillBadge variant="purple" size="sm">
                        <Sparkles size={10} className="mr-0.5" />
                        {item.badge}
                      </PillBadge>
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </aside>
  );
};
