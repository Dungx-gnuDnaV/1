"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { PillButton } from "@/components/ui/PillButton";
import { PillBadge } from "@/components/ui/PillBadge";
import { Award, Plus, Trophy, ShieldAlert, CheckCircle, PlusCircle, MinusCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function ConductPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConductData();
  }, []);

  const fetchConductData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/conduct");
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
        {/* Header */}
        <div className="pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Award className="text-amber-500" />
            Thi đua, Rèn luyện & Khen thưởng
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Ghi nhận điểm cộng thi đua, vi phạm nội quy, bảng xếp hạng tuần/tháng và danh hiệu học sinh.
          </p>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Leaderboard Column */}
          <GlassCard className="space-y-4">
            <div className="flex items-center gap-2">
              <Trophy size={20} className="text-amber-500" />
              <h3 className="font-bold text-base">Bảng Xếp hạng Thi đua</h3>
            </div>

            <div className="space-y-2">
              {loading && <p className="text-xs text-slate-400">Đang tải xếp hạng...</p>}
              {!loading &&
                data?.standings?.map((st: any, idx: number) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                          idx === 0
                            ? "bg-amber-500 text-white"
                            : idx === 1
                            ? "bg-slate-300 text-slate-800"
                            : "bg-amber-700/30 text-amber-600"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div>
                        <p className="font-bold text-xs text-slate-800 dark:text-slate-200">
                          Lớp {st.name}
                        </p>
                        <p className="text-[10px] text-slate-400">{st.student_count || 35} học sinh</p>
                      </div>
                    </div>
                    <PillBadge variant="success" size="sm">
                      +{st.total_points || 0} điểm
                    </PillBadge>
                  </div>
                ))}
            </div>
          </GlassCard>

          {/* Conduct Events Log */}
          <GlassCard className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base">Nhật ký Điểm Thi đua / Vi phạm</h3>
              <PillBadge variant="info" size="sm">
                Xác minh minh bạch
              </PillBadge>
            </div>

            <div className="space-y-3">
              {loading && <p className="text-xs text-slate-400">Đang tải sự kiện...</p>}
              {!loading &&
                data?.events?.map((ev: any) => (
                  <div
                    key={ev.id}
                    className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      {ev.points >= 0 ? (
                        <PlusCircle size={20} className="text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <MinusCircle size={20} className="text-rose-500 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                            {ev.student_name} ({ev.student_code})
                          </span>
                          <PillBadge variant={ev.points >= 0 ? "success" : "danger"} size="sm">
                            {ev.points >= 0 ? `+${ev.points}` : ev.points} điểm
                          </PillBadge>
                        </div>
                        <p className="font-medium text-xs text-slate-700 dark:text-slate-300 mt-0.5">
                          {ev.title}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {ev.description || "Không có ghi chú thêm."}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {formatDate(ev.created_at)}
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
