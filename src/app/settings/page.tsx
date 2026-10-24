"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { PillButton } from "@/components/ui/PillButton";
import { PillBadge } from "@/components/ui/PillBadge";
import { Settings, Shield, Clock, Database, Save, CheckCircle2 } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default function SettingsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Settings className="text-blue-600" />
            Cấu hình Hệ thống & Nhật ký Audit Log
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Quản lý thông tin nhà trường, quy tắc điểm danh, tích hợp RFID/AI và nhật ký hoạt động hệ thống.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings List */}
          <GlassCard className="lg:col-span-1 space-y-4">
            <h3 className="font-bold text-base flex items-center gap-2">
              <Database size={18} className="text-blue-500" />
              Cấu hình chung
            </h3>

            <div className="space-y-3 text-xs">
              {loading && <p className="text-slate-400">Đang tải cấu hình...</p>}
              {!loading &&
                data?.settings?.map((s: any) => (
                  <div key={s.key} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block capitalize">
                      {s.description || s.key}
                    </label>
                    <input
                      type="text"
                      defaultValue={s.value}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                    />
                  </div>
                ))}

              <div className="pt-2 flex justify-end">
                <PillButton variant="primary" size="sm" icon={<Save size={14} />}>
                  Lưu cấu hình
                </PillButton>
              </div>
            </div>
          </GlassCard>

          {/* Audit Log */}
          <GlassCard className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Shield size={18} className="text-emerald-500" />
                Nhật ký Hoạt động (Audit Log)
              </h3>
              <PillBadge variant="success" size="sm">
                Bảo mật 100%
              </PillBadge>
            </div>

            <div className="space-y-2">
              {loading && <p className="text-xs text-slate-400">Đang tải nhật ký...</p>}
              {!loading &&
                data?.logs?.map((log: any) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {log.action}
                        </span>
                        <PillBadge variant="outline" size="sm">
                          {log.entity_type}
                        </PillBadge>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Thực hiện bởi: {log.user_name || "Hệ thống"} | {log.details}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {formatDateTime(log.created_at)}
                    </span>
                  </div>
                ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </AppLayout>
  );
}
