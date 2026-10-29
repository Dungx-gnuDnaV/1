"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { NotificationCenter } from "@/components/layout/NotificationCenter";
import { cn } from "@/lib/utils";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<any>({
    id: "user_admin",
    username: "admin",
    fullName: "Nguyễn Văn Admin",
    roleId: "role_admin",
    roleName: "Super Admin",
    email: "admin@smart-sms.edu.vn",
  });
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    fetchSession();
  }, []);

  const fetchSession = async () => {
    try {
      const res = await fetch("/api/auth/session");
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRoleSwitch = (roleId: string) => {
    const roleMap: Record<string, any> = {
      role_admin: { roleId: "role_admin", roleName: "Super Admin", fullName: "Nguyễn Văn Admin" },
      role_principal: { roleId: "role_principal", roleName: "Ban Giám Hiệu", fullName: "ThS. Trần Thị Mai (BGH)" },
      role_teacher: { roleId: "role_teacher", roleName: "Giáo Viên", fullName: "Cô Nguyễn Thu Hương" },
      role_student: { roleId: "role_student", roleName: "Học Sinh", fullName: "Nguyễn Minh Anh" },
      role_parent: { roleId: "role_parent", roleName: "Phụ Huynh", fullName: "Nguyễn Văn Hùng" },
    };

    if (roleMap[roleId]) {
      setUser((prev: any) => ({ ...prev, ...roleMap[roleId] }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 font-sans transition-colors">
      <Sidebar
        userRole={user?.roleId}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className={cn("transition-all duration-300 min-h-screen flex flex-col", sidebarOpen ? "ml-64" : "ml-20")}>
        <Header
          user={user}
          onRoleSwitch={handleRoleSwitch}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onToggleNotifications={() => setNotificationsOpen(!notificationsOpen)}
        />

        <NotificationCenter
          isOpen={notificationsOpen}
          onClose={() => setNotificationsOpen(false)}
        />

        <CommandPalette
          isOpen={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
        />

        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
