"use client";

import React, { useState, useEffect } from "react";
import { Bell, Clock, X } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { PillBadge } from "@/components/ui/PillBadge";

interface NotificationItem {
  id: string;
  priority?: string;
  category?: string;
  title: string;
  content: string;
  created_at: string;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
      fetch("/api/notifications")
        .then((res) => res.json())
        .then((data) => {
          if (isMounted) {
            setNotifications(data.notifications || []);
            setLoading(false);
          }
        })
        .catch((err) => {
          console.error(err);
          if (isMounted) setLoading(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="absolute right-4 top-16 z-50 w-80 md:w-96 rounded-3xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800/80 shadow-2xl backdrop-blur-2xl p-4 transition-all">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-blue-600 dark:text-blue-400" />
          <span className="font-bold text-sm text-slate-800 dark:text-slate-100">Trung tâm Thông báo</span>
        </div>
        <button onClick={onClose} aria-label="Đóng thông báo" className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          <X size={16} />
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto py-2 space-y-2 my-2">
        {loading && <p className="text-xs text-center py-6 text-slate-400">Đang tải thông báo...</p>}
        {!loading && notifications.length === 0 && (
          <p className="text-xs text-center py-6 text-slate-400">Không có thông báo mới.</p>
        )}
        {!loading &&
          notifications.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col gap-1.5 hover:border-blue-500/30 transition-all"
            >
              <div className="flex items-center justify-between">
                <PillBadge
                  variant={
                    item.priority === "High"
                      ? "danger"
                      : item.category === "Attendance"
                      ? "warning"
                      : "info"
                  }
                  size="sm"
                >
                  {item.category}
                </PillBadge>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Clock size={10} />
                  {formatDateTime(item.created_at)}
                </span>
              </div>
              <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-200">{item.title}</h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">{item.content}</p>
            </div>
          ))}
      </div>
    </div>
  );
};
