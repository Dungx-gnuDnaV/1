"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { PillBadge } from "@/components/ui/PillBadge";
import { PillButton } from "@/components/ui/PillButton";
import { Bell, Plus, Filter, Clock, Send, ShieldCheck, Tag } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      const json = await res.json();
      setNotifications(json.notifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotices =
    selectedCategory === "All"
      ? notifications
      : notifications.filter((n) => n.category === selectedCategory);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Bell className="text-blue-600" />
              Trung tâm Thông báo & Giao tiếp
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Quản lý và công bố thông báo nhà trường, lịch thi, nghỉ học và tương tác phụ huynh.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <PillButton variant="primary" icon={<Plus size={16} />}>
              Tạo thông báo mới
            </PillButton>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {["All", "General", "Attendance", "Grade", "Event", "System"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              {cat === "All" ? "Tất cả" : cat}
            </button>
          ))}
        </div>

        {/* Notifications Roster */}
        <div className="space-y-3">
          {loading && <p className="text-xs text-slate-400">Đang tải danh sách thông báo...</p>}
          {!loading && filteredNotices.length === 0 && (
            <p className="text-xs text-slate-400">Không có thông báo phù hợp.</p>
          )}

          {!loading &&
            filteredNotices.map((notice) => (
              <GlassCard key={notice.id} gradient className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PillBadge
                      variant={
                        notice.priority === "High"
                          ? "danger"
                          : notice.category === "Attendance"
                          ? "warning"
                          : "info"
                      }
                      size="sm"
                    >
                      {notice.category}
                    </PillBadge>
                    <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                      <Clock size={12} />
                      {formatDateTime(notice.created_at)}
                    </span>
                  </div>
                  <PillBadge variant="purple" size="sm">
                    {notice.priority || "Normal"} Priority
                  </PillBadge>
                </div>

                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                  {notice.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {notice.content}
                </p>
              </GlassCard>
            ))}
        </div>
      </div>
    </AppLayout>
  );
}
