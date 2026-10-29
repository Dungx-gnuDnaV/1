"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { PillButton } from "@/components/ui/PillButton";
import { PillBadge } from "@/components/ui/PillBadge";
import { BookOpen, Sparkles, Save, TrendingUp, AlertCircle, RefreshCw } from "lucide-react";

export default function GradesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("class_11a1");
  const [selectedSubject, setSelectedSubject] = useState("sub_math");
  const [selectedSemester, setSelectedSemester] = useState("sem_2_2024");
  const [studentGrades, setStudentGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const subjects = [
    { id: "sub_math", name: "Toán học" },
    { id: "sub_lit", name: "Ngữ văn" },
    { id: "sub_eng", name: "Tiếng Anh" },
    { id: "sub_phys", name: "Vật lý" },
    { id: "sub_chem", name: "Hóa học" },
  ];

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    fetchGrades();
  }, [selectedClass, selectedSubject, selectedSemester]);

  const fetchClasses = async () => {
    try {
      const res = await fetch("/api/classes");
      const json = await res.json();
      setClasses(json.classes || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchGrades = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        classId: selectedClass,
        subjectId: selectedSubject,
        semesterId: selectedSemester,
      });
      const res = await fetch(`/api/grades?${params.toString()}`);
      const json = await res.json();
      setStudentGrades(json.studentGrades || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = async (studentId: string, assessmentCode: string, scoreStr: string) => {
    const val = parseFloat(scoreStr);
    if (isNaN(val) || val < 0 || val > 10) return;

    try {
      const res = await fetch("/api/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          subjectId: selectedSubject,
          semesterId: selectedSemester,
          assessmentCode,
          score: val,
        }),
      });
      if (res.ok) {
        fetchGrades();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BookOpen className="text-blue-600" />
              Quản lý Điểm số & Sổ điểm Điện tử
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Nhập điểm thường xuyên, giữa kỳ, cuối kỳ và tự động tính điểm TBM học kỳ.
            </p>
          </div>
        </div>

        {/* Filters */}
        <GlassCard className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                Lớp học
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    Lớp {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                Môn học
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                Học kỳ
              </label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
              >
                <option value="sem_1_2024">Học kỳ I (2024-2025)</option>
                <option value="sem_2_2024">Học kỳ II (2024-2025)</option>
              </select>
            </div>
          </div>
        </GlassCard>

        {/* Grade Matrix Table */}
        <GlassCard className="p-0 overflow-hidden">
          <div className="p-4 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
            <h3 className="font-bold text-sm">
              Sổ điểm môn {subjects.find((s) => s.id === selectedSubject)?.name}
            </h3>
            <PillBadge variant="purple" size="sm">
              Công thức TBM: (TX + GK*2 + CK*3) / 6
            </PillBadge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200/60 dark:border-slate-800/60">
                <tr>
                  <th className="p-3.5 pl-5">Học sinh</th>
                  <th className="p-3.5">Mã HS</th>
                  <th className="p-3.5">Thường xuyên (Hệ số 1)</th>
                  <th className="p-3.5">Giữa kỳ (Hệ số 2)</th>
                  <th className="p-3.5">Cuối kỳ (Hệ số 3)</th>
                  <th className="p-3.5 pr-5 text-right">TBM Môn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {loading && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400">
                      Đang tải bảng điểm...
                    </td>
                  </tr>
                )}

                {!loading &&
                  studentGrades.map((std) => (
                    <tr key={std.student_id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="p-3.5 pl-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={std.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=User"}
                            alt="Avatar"
                            className="w-7 h-7 rounded-full bg-blue-100"
                          />
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {std.full_name}
                          </span>
                        </div>
                      </td>
                      <td className="p-3.5 font-medium">{std.student_code}</td>

                      {/* Regular Score */}
                      <td className="p-3.5">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          defaultValue={std.txScore ?? ""}
                          onBlur={(e) => handleScoreChange(std.student_id, "TX", e.target.value)}
                          className="w-16 px-2 py-1 text-center font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        />
                      </td>

                      {/* Midterm Score */}
                      <td className="p-3.5">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          defaultValue={std.gkScore ?? ""}
                          onBlur={(e) => handleScoreChange(std.student_id, "GK", e.target.value)}
                          className="w-16 px-2 py-1 text-center font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        />
                      </td>

                      {/* Final Score */}
                      <td className="p-3.5">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          defaultValue={std.ckScore ?? ""}
                          onBlur={(e) => handleScoreChange(std.student_id, "CK", e.target.value)}
                          className="w-16 px-2 py-1 text-center font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        />
                      </td>

                      {/* TBM Calculated */}
                      <td className="p-3.5 pr-5 text-right font-extrabold text-sm text-blue-600 dark:text-blue-400">
                        {std.avgScore !== null ? std.avgScore : "--"}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </AppLayout>
  );
}
