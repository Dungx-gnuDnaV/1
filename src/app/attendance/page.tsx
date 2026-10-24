"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { PillButton } from "@/components/ui/PillButton";
import { PillBadge } from "@/components/ui/PillBadge";
import {
  CalendarCheck,
  QrCode,
  Camera,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Sparkles,
  RefreshCw,
  UserCheck,
  Shield,
  FileSpreadsheet,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default function AttendancePage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("class_11a1");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // RFID Simulator state
  const [rfidInput, setRfidInput] = useState("");
  const [rfidLog, setRfidLog] = useState<any[]>([]);
  const [rfidMessage, setRfidMessage] = useState<any>(null);

  // Camera Verification Modal state
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraStatus, setCameraStatus] = useState<"idle" | "scanning" | "success" | "failed">("idle");
  const [verifiedStudent, setVerifiedStudent] = useState<any>(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchAttendance();
    }
  }, [selectedClass, selectedDate]);

  const fetchClasses = async () => {
    try {
      const res = await fetch("/api/classes");
      const json = await res.json();
      setClasses(json.classes || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ classId: selectedClass, date: selectedDate });
      const res = await fetch(`/api/attendance?${params.toString()}`);
      const json = await res.json();
      setAttendanceData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (studentId: string, status: string) => {
    if (!attendanceData?.session?.id) return;
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: attendanceData.session.id,
          studentId,
          status,
          method: "Manual",
        }),
      });
      if (res.ok) {
        fetchAttendance();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRfidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfidInput.trim()) return;

    try {
      const res = await fetch("/api/attendance/rfid-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rfidCode: rfidInput.trim(), classId: selectedClass }),
      });
      const data = await res.json();

      setRfidMessage(data);
      setRfidLog((prev) => [
        {
          time: new Date().toLocaleTimeString(),
          code: rfidInput.trim(),
          success: data.success,
          message: data.message,
        },
        ...prev,
      ]);

      setRfidInput("");
      fetchAttendance();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSimulateCameraVerification = () => {
    setShowCameraModal(true);
    setCameraStatus("scanning");
    setTimeout(() => {
      setCameraStatus("success");
      setVerifiedStudent({
        fullName: "Nguyễn Minh Anh",
        studentCode: "HS2023001",
        confidence: "98.4%",
      });
    }, 2000);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CalendarCheck className="text-blue-600" />
              Điểm danh Thông minh & RFID
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Điểm danh thủ công, quét thẻ RFID tự động, chống ghi nhận trùng và mô phỏng xác minh khuôn mặt.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <PillButton
              variant="outline"
              icon={<Camera size={16} className="text-violet-500" />}
              onClick={handleSimulateCameraVerification}
            >
              Thử Camera AI [DEMO]
            </PillButton>
          </div>
        </div>

        {/* Controls Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GlassCard className="p-4 space-y-3 md:col-span-2">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                  Chọn Lớp
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      Lớp {c.name} (Khối {c.grade_level})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                  Chọn Ngày
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 text-xs rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                />
              </div>

              <div className="pt-5">
                <PillButton variant="ghost" size="sm" icon={<RefreshCw size={14} />} onClick={fetchAttendance}>
                  Làm mới
                </PillButton>
              </div>
            </div>
          </GlassCard>

          {/* RFID Quick Simulator Panel */}
          <GlassCard gradient className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <QrCode size={18} className="text-purple-600 dark:text-purple-400" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-100">
                Bộ mô phỏng RFID Reader [DEMO]
              </h3>
            </div>

            <form onSubmit={handleRfidSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={rfidInput}
                onChange={(e) => setRfidInput(e.target.value)}
                placeholder="Nhập/Quét mã thẻ (VD: RFID_11A1_01)"
                className="w-full px-3 py-1.5 text-xs rounded-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
              />
              <PillButton type="submit" variant="primary" size="sm">
                Quét
              </PillButton>
            </form>

            {rfidMessage && (
              <div
                className={`p-2 rounded-xl text-[11px] font-medium border ${
                  rfidMessage.success
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-rose-50 text-rose-800 border-rose-200"
                }`}
              >
                {rfidMessage.message}
              </div>
            )}
          </GlassCard>
        </div>

        {/* Attendance Table */}
        <GlassCard className="p-0 overflow-hidden">
          <div className="p-4 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
              Danh sách Điểm danh Ngày {selectedDate}
            </h3>
            <PillBadge variant="info" size="sm">
              Sĩ số: {attendanceData?.records?.length || 0} học sinh
            </PillBadge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200/60 dark:border-slate-800/60">
                <tr>
                  <th className="p-3.5 pl-5">Học sinh</th>
                  <th className="p-3.5">Mã HS</th>
                  <th className="p-3.5">Mã RFID</th>
                  <th className="p-3.5">Thời gian quét</th>
                  <th className="p-3.5">Phương thức</th>
                  <th className="p-3.5">Trạng thái điểm danh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {loading && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400">
                      Đang tải danh sách điểm danh...
                    </td>
                  </tr>
                )}

                {!loading &&
                  attendanceData?.records?.map((rec: any) => (
                    <tr key={rec.student_id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="p-3.5 pl-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={rec.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=User"}
                            alt="Avatar"
                            className="w-7 h-7 rounded-full bg-blue-100"
                          />
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {rec.full_name}
                          </span>
                        </div>
                      </td>
                      <td className="p-3.5 font-medium">{rec.student_code}</td>
                      <td className="p-3.5">
                        <span className="font-mono text-[11px] text-slate-500">
                          {rec.rfid_code || "N/A"}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-500">
                        {rec.time_recorded ? formatDateTime(rec.time_recorded) : "Chưa ghi nhận"}
                      </td>
                      <td className="p-3.5">
                        <PillBadge variant="outline" size="sm">
                          {rec.method || "Manual"}
                        </PillBadge>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleUpdateStatus(rec.student_id, "Present")}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                              rec.status === "Present"
                                ? "bg-emerald-600 text-white shadow-sm shadow-emerald-500/20"
                                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-emerald-100"
                            }`}
                          >
                            Có mặt
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(rec.student_id, "Late")}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                              rec.status === "Late"
                                ? "bg-amber-500 text-white shadow-sm shadow-amber-500/20"
                                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-amber-100"
                            }`}
                          >
                            Đi muộn
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(rec.student_id, "Absent_Excused")}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                              rec.status === "Absent_Excused"
                                ? "bg-sky-600 text-white shadow-sm shadow-sky-500/20"
                                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-sky-100"
                            }`}
                          >
                            Vắng có phép
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(rec.student_id, "Absent_Unexcused")}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                              rec.status === "Absent_Unexcused"
                                ? "bg-rose-600 text-white shadow-sm shadow-rose-500/20"
                                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-rose-100"
                            }`}
                          >
                            Vắng không phép
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Camera AI Simulation Modal */}
        {showCameraModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Camera size={18} className="text-violet-600" />
                  <h3 className="font-bold text-sm">Xác minh Khuôn mặt AI [Mô phỏng DEMO]</h3>
                </div>
                <PillBadge variant="purple" size="sm">
                  DEMO Mode
                </PillBadge>
              </div>

              <div className="aspect-video bg-slate-950 rounded-2xl relative overflow-hidden flex flex-col items-center justify-center text-white p-4">
                {cameraStatus === "scanning" && (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
                    <p className="text-xs text-violet-300 font-semibold animate-pulse">
                      Đang nhận diện sinh trắc học...
                    </p>
                  </div>
                )}

                {cameraStatus === "success" && (
                  <div className="flex flex-col items-center text-center space-y-2">
                    <CheckCircle size={40} className="text-emerald-400" />
                    <span className="font-bold text-sm text-emerald-300">
                      Xác minh Danh tính Thành công
                    </span>
                    <p className="text-xs text-slate-300">
                      {verifiedStudent?.fullName} ({verifiedStudent?.studentCode})
                    </p>
                    <PillBadge variant="success" size="sm">
                      Độ chính xác: {verifiedStudent?.confidence}
                    </PillBadge>
                  </div>
                )}
              </div>

              <p className="text-[10px] text-slate-400 italic text-center">
                * Quy trình tuân thủ chính sách bảo vệ dữ liệu sinh trắc học của nhà trường và không lưu trữ ảnh thô khi chưa cấp phép.
              </p>

              <div className="pt-2 flex justify-end">
                <PillButton variant="secondary" size="sm" onClick={() => setShowCameraModal(false)}>
                  Đóng
                </PillButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
