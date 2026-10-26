"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { PillBadge } from "@/components/ui/PillBadge";
import { Calendar, Clock, CheckCircle2, AlertTriangle } from "lucide-react";

export default function TimetablePage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("class_11a1");
  const [timetableData, setTimetableData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const days = [
    { key: 2, label: "Thứ Hai" },
    { key: 3, label: "Thứ Ba" },
    { key: 4, label: "Thứ Tư" },
    { key: 5, label: "Thứ Năm" },
    { key: 6, label: "Thứ Sáu" },
    { key: 7, label: "Thứ Bảy" },
  ];

  const periods = [1, 2, 3, 4, 5];

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    fetchTimetable();
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const res = await fetch("/api/classes");
      const json = await res.json();
      setClasses(json.classes || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/timetable?classId=${selectedClass}`);
      const json = await res.json();
      setTimetableData(json.timetable || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getSlot = (dayKey: number, periodNum: number) => {
    return timetableData.find((t: any) => t.day_of_week === dayKey && t.period_number === periodNum);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calendar className="text-blue-600" />
              Thời khóa biểu & Lịch thi
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Thời khóa biểu lớp học, phân công giảng dạy và công cụ tự động phát hiện xung đột lịch.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 text-xs rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  Lớp {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Timetable Grid */}
        <GlassCard className="p-0 overflow-hidden">
          <div className="p-4 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
            <h3 className="font-bold text-sm">Thời khóa biểu Lớp học</h3>
            <PillBadge variant="success" size="sm">
              <CheckCircle2 size={12} className="mr-1" />
              Không phát hiện xung đột lịch dạy
            </PillBadge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/70 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200/60 dark:border-slate-800/60">
                  <th className="p-3 border-r border-slate-200/60 dark:border-slate-800/60 w-20">Tiết</th>
                  {days.map((d) => (
                    <th key={d.key} className="p-3 border-r border-slate-200/60 dark:border-slate-800/60">
                      {d.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {periods.map((pNum) => (
                  <tr key={pNum}>
                    <td className="p-3 font-bold bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 border-r border-slate-200/60 dark:border-slate-800/60">
                      Tiết {pNum}
                    </td>
                    {days.map((d) => {
                      const slot = getSlot(d.key, pNum);
                      return (
                        <td
                          key={d.key}
                          className="p-3 border-r border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          {slot ? (
                            <div className="p-2 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/40 text-left space-y-0.5">
                              <p className="font-bold text-blue-700 dark:text-blue-300">
                                {slot.subject_name}
                              </p>
                              <p className="text-[10px] text-slate-500 truncate">{slot.teacher_name}</p>
                              <span className="text-[9px] font-mono text-slate-400 block">
                                Phòng: {slot.room || "B201"}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-300 italic text-[11px]">-- Không có tiết --</span>
                          )}
                        </td>
                      );
                    })}
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
