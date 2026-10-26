"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { PillButton } from "@/components/ui/PillButton";
import { PillBadge } from "@/components/ui/PillBadge";
import { Users, GraduationCap, UserCheck, BookOpen, Calendar, ShieldCheck } from "lucide-react";

export default function ClassesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/classes");
      const json = await res.json();
      setClasses(json.classes || []);
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
            <Users className="text-blue-600" />
            Quản lý Lớp học & Phân công Giáo viên
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Danh sách các lớp học theo khối 10, 11, 12 và giáo viên chủ nhiệm tương ứng.
          </p>
        </div>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading && <p className="text-xs text-slate-400 col-span-3">Đang tải danh sách lớp...</p>}
          {!loading &&
            classes.map((c) => (
              <GlassCard key={c.id} gradient className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold flex items-center justify-center text-lg shadow-md shadow-blue-500/20">
                      {c.name}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
                        Lớp {c.name}
                      </h3>
                      <p className="text-[11px] text-slate-400">Khối {c.grade_level} | Phòng {c.room_number || "A101"}</p>
                    </div>
                  </div>
                  <PillBadge variant="purple" size="sm">
                    {c.student_count || 35} học sinh
                  </PillBadge>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Giáo viên Chủ nhiệm
                  </span>
                  <div className="flex items-center gap-2">
                    <UserCheck size={16} className="text-emerald-500" />
                    <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                      {c.homeroom_teacher_name || "Chưa phân công"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-500">Năm học: 2024 - 2025</span>
                  <PillButton variant="outline" size="sm">
                    Chi tiết Lớp
                  </PillButton>
                </div>
              </GlassCard>
            ))}
        </div>
      </div>
    </AppLayout>
  );
}
