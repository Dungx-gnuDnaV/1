"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { PillBadge } from "@/components/ui/PillBadge";
import { PillButton } from "@/components/ui/PillButton";
import {
  Users,
  GraduationCap,
  CalendarCheck,
  TrendingUp,
  Award,
  AlertTriangle,
  BookOpen,
  Sparkles,
  ArrowUpRight,
  CheckCircle,
  Clock,
  ChevronRight,
  BarChart3,
  Calendar,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/stats");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const roleId = data?.roleId || "role_admin";

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Banner Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Dashboard Quản lý
              </h1>
              <PillBadge variant="purple" size="sm">
                <Sparkles size={12} className="mr-1" /> Real-time
              </PillBadge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Hệ thống tổng hợp dữ liệu học tập, chuyên cần và thi đua thời gian thực.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/attendance">
              <PillButton variant="primary" size="sm" icon={<CalendarCheck size={16} />}>
                Điểm danh nhanh
              </PillButton>
            </Link>
            <Link href="/ai-assistant">
              <PillButton variant="outline" size="sm" icon={<Sparkles size={16} className="text-violet-500" />}>
                Hỏi Trợ lý AI
              </PillButton>
            </Link>
          </div>
        </div>

        {/* Principal & Admin View */}
        {(roleId === "role_admin" || roleId === "role_principal") && (
          <div className="space-y-6">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <GlassCard gradient className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Tổng số Học sinh
                  </p>
                  <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
                    {data?.stats?.studentCount || 113}
                  </p>
                  <span className="inline-flex items-center text-[11px] text-emerald-600 font-semibold mt-1">
                    <TrendingUp size={12} className="mr-0.5" /> +100% sĩ số
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <GraduationCap size={28} />
                </div>
              </GlassCard>

              <GlassCard gradient className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Tỷ lệ Chuyên cần Hôm nay
                  </p>
                  <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                    {data?.stats?.attendanceRate || 96}%
                  </p>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Vắng: {data?.stats?.absent || 1} | Muộn: {data?.stats?.late || 1}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CalendarCheck size={28} />
                </div>
              </GlassCard>

              <GlassCard gradient className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Điểm Trung bình Toàn trường
                  </p>
                  <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
                    {data?.stats?.gradeAvg || 8.4}
                  </p>
                  <span className="text-[11px] text-slate-500 mt-1 block">Học kỳ II (2024 - 2025)</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <BookOpen size={28} />
                </div>
              </GlassCard>

              <GlassCard gradient className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Tổng số Lớp học
                  </p>
                  <p className="text-3xl font-extrabold text-violet-600 dark:text-violet-400 mt-1">
                    {data?.stats?.classCount || 3}
                  </p>
                  <span className="text-[11px] text-slate-500 mt-1 block">Khối 10, 11, 12</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                  <Users size={28} />
                </div>
              </GlassCard>
            </div>

            {/* Charts & Rankings Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Class Standings Leaderboard */}
              <GlassCard className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award size={20} className="text-amber-500" />
                    <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
                      Bảng xếp hạng Thi đua Các lớp
                    </h3>
                  </div>
                  <Link href="/conduct">
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold flex items-center hover:underline">
                      Xem tất cả <ChevronRight size={14} />
                    </span>
                  </Link>
                </div>

                <div className="space-y-2">
                  {data?.classStandings?.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
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
                          <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
                            Lớp {item.name}
                          </p>
                          <p className="text-[11px] text-slate-400">Sĩ số: {item.student_count || 35} học sinh</p>
                        </div>
                      </div>
                      <PillBadge variant="success" size="md">
                        +{item.conduct_points || 10} điểm thi đua
                      </PillBadge>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Critical Alerts */}
              <GlassCard className="space-y-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={20} className="text-rose-500" />
                  <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
                    Vấn đề Cần Chú ý
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-2xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-800/40 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-rose-700 dark:text-rose-300">
                        Học sinh vắng không phép
                      </span>
                      <span className="text-[10px] text-slate-400">08:15 AM</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                      Học sinh Phạm Quốc Cường (11A1) vắng mặt không phép hôm nay.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-amber-700 dark:text-amber-300">
                        Sự giảm sút điểm số
                      </span>
                      <span className="text-[10px] text-slate-400">Hôm qua</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                      Môn Vật lý khối 10 ghi nhận 3 bài kiểm tra dưới trung bình.
                    </p>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        )}

        {/* Teacher View */}
        {roleId === "role_teacher" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <GlassCard gradient>
                <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">Lớp Chủ nhiệm</h3>
                <p className="text-2xl font-extrabold text-blue-600 mt-1">11A1</p>
                <p className="text-xs text-slate-500 mt-1">Sĩ số: 38 học sinh | Chuyên cần: 97.4%</p>
              </GlassCard>

              <GlassCard gradient>
                <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">Lịch dạy Hôm nay</h3>
                <p className="text-2xl font-extrabold text-emerald-600 mt-1">3 Tiết</p>
                <p className="text-xs text-slate-500 mt-1">Tiết 1-2 (11A1), Tiết 4 (12A1)</p>
              </GlassCard>

              <GlassCard gradient>
                <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">Công việc Cần làm</h3>
                <p className="text-2xl font-extrabold text-amber-600 mt-1">2 Bài kiểm tra</p>
                <p className="text-xs text-slate-500 mt-1">Cần nhập điểm Giữa kỳ môn Ngữ văn</p>
              </GlassCard>
            </div>
          </div>
        )}

        {/* Student View */}
        {roleId === "role_student" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <GlassCard gradient>
                <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">Điểm TBM Hiện tại</h3>
                <p className="text-3xl font-extrabold text-blue-600 mt-1">8.85</p>
                <PillBadge variant="success" size="sm" className="mt-2">Học lực Giỏi</PillBadge>
              </GlassCard>

              <GlassCard gradient>
                <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">Tỷ lệ Chuyên cần</h3>
                <p className="text-3xl font-extrabold text-emerald-600 mt-1">98.5%</p>
                <p className="text-xs text-slate-500 mt-1">Có mặt 40/41 buổi</p>
              </GlassCard>

              <GlassCard gradient>
                <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">Thành tích Cá nhân</h3>
                <p className="text-3xl font-extrabold text-violet-600 mt-1">+25 Điểm</p>
                <p className="text-xs text-slate-500 mt-1">Hạng 1 Thi đua Lớp 11A1</p>
              </GlassCard>
            </div>
          </div>
        )}

        {/* Parent View */}
        {roleId === "role_parent" && (
          <div className="space-y-6">
            <GlassCard gradient className="p-6">
              <div className="flex items-center gap-4">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=HS2023001"
                  alt="Student"
                  className="w-16 h-16 rounded-full bg-blue-100"
                />
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    Học sinh: Nguyễn Minh Anh
                  </h3>
                  <p className="text-xs text-slate-500">Mã HS: HS2023001 | Lớp: 11A1 | GVCN: Cô Nguyễn Thu Hương</p>
                  <div className="flex gap-2 mt-2">
                    <PillBadge variant="success">Điểm danh: Có mặt hôm nay (07:12 AM)</PillBadge>
                    <PillBadge variant="info">TBM: 8.85</PillBadge>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
