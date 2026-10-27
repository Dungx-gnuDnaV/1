"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { PillButton } from "@/components/ui/PillButton";
import { PillBadge } from "@/components/ui/PillBadge";
import {
  GraduationCap,
  Search,
  Plus,
  Filter,
  QrCode,
  Edit,
  Trash2,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  MoreHorizontal,
  X,
  Check,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    studentCode: "",
    dob: "",
    gender: "Male",
    classId: "",
    rfidCode: "",
    address: "",
    parentName: "",
    parentPhone: "",
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [search, selectedClass, selectedStatus, page]);

  const fetchClasses = async () => {
    try {
      const res = await fetch("/api/classes");
      const json = await res.json();
      setClasses(json.classes || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        classId: selectedClass,
        status: selectedStatus,
        page: page.toString(),
        limit: "10",
      });
      const res = await fetch(`/api/students?${params.toString()}`);
      const json = await res.json();
      setStudents(json.students || []);
      setTotalPages(json.pagination?.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setShowAddModal(false);
        setFormData({
          fullName: "",
          studentCode: "",
          dob: "",
          gender: "Male",
          classId: "",
          rfidCode: "",
          address: "",
          parentName: "",
          parentPhone: "",
        });
        fetchStudents();
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Lỗi tạo học sinh");
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
              <GraduationCap className="text-blue-600" />
              Quản lý Hồ sơ Học sinh
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Danh sách, hồ sơ cá nhân, thẻ RFID và thông tin phụ huynh toàn trường.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <PillButton
              variant="primary"
              icon={<Plus size={16} />}
              onClick={() => setShowAddModal(true)}
            >
              Thêm học sinh mới
            </PillButton>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <GlassCard className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm tên, mã HS, thẻ RFID..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-full bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Class Filter */}
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 text-xs rounded-full bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value="">-- Tất cả Lớp học --</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  Lớp {c.name} (Khối {c.grade_level})
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 text-xs rounded-full bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value="">-- Tất cả Trạng thái --</option>
              <option value="Active">Đang học (Active)</option>
              <option value="Graduated">Đã tốt nghiệp</option>
              <option value="Transferred">Chuyển trường</option>
            </select>

            {/* Reset Button */}
            <PillButton
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch("");
                setSelectedClass("");
                setSelectedStatus("");
                setPage(1);
              }}
            >
              Đặt lại bộ lọc
            </PillButton>
          </div>
        </GlassCard>

        {/* Student Data Table */}
        <GlassCard className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200/60 dark:border-slate-800/60">
                <tr>
                  <th className="p-3.5 pl-5">Học sinh</th>
                  <th className="p-3.5">Mã HS</th>
                  <th className="p-3.5">Lớp học</th>
                  <th className="p-3.5">Thẻ RFID</th>
                  <th className="p-3.5">Phụ huynh</th>
                  <th className="p-3.5">Trạng thái</th>
                  <th className="p-3.5 pr-5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {loading && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400">
                      Đang tải danh sách học sinh...
                    </td>
                  </tr>
                )}

                {!loading && students.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400">
                      Không tìm thấy dữ liệu học sinh.
                    </td>
                  </tr>
                )}

                {!loading &&
                  students.map((std) => (
                    <tr
                      key={std.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="p-3.5 pl-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={std.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=User"}
                            alt="Avatar"
                            className="w-8 h-8 rounded-full bg-blue-100 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-200">
                              {std.full_name}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {std.gender === "Male" ? "Nam" : "Nữ"} | NS: {formatDate(std.dob)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-700 dark:text-slate-300">
                        {std.student_code}
                      </td>
                      <td className="p-3.5">
                        <PillBadge variant="info" size="sm">
                          Lớp {std.class_name || "Chưa xếp"}
                        </PillBadge>
                      </td>
                      <td className="p-3.5">
                        {std.rfid_code ? (
                          <PillBadge variant="purple" size="sm">
                            <QrCode size={10} className="mr-1" />
                            {std.rfid_code}
                          </PillBadge>
                        ) : (
                          <span className="text-slate-400 italic">Chưa gắn thẻ</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <div>
                          <p className="font-medium text-slate-700 dark:text-slate-300">
                            {std.parent_name || "Chưa có"}
                          </p>
                          <p className="text-[10px] text-slate-400">{std.parent_phone || ""}</p>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <PillBadge
                          variant={std.status === "Active" ? "success" : "warning"}
                          size="sm"
                        >
                          {std.status === "Active" ? "Đang học" : std.status}
                        </PillBadge>
                      </td>
                      <td className="p-3.5 pr-5 text-right">
                        <button
                          className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
                          title="Tùy chọn"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between p-4 border-t border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50">
            <span className="text-xs text-slate-500">
              Trang {page} / {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <PillButton
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
              >
                <ChevronLeft size={14} /> Trước
              </PillButton>
              <PillButton
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              >
                Sau <ChevronRight size={14} />
              </PillButton>
            </div>
          </div>
        </GlassCard>

        {/* Modal Add Student */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
            <div className="w-full max-w-lg bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Thêm Hồ sơ Học sinh Mới
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateStudent} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Họ và Tên (*)</label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Nguyễn Văn A"
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Mã Học sinh (*)</label>
                    <input
                      type="text"
                      required
                      value={formData.studentCode}
                      onChange={(e) => setFormData({ ...formData, studentCode: e.target.value })}
                      placeholder="HS2025001"
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Ngày sinh (*)</label>
                    <input
                      type="date"
                      required
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Giới tính</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    >
                      <option value="Male">Nam</option>
                      <option value="Female">Nữ</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Xếp vào Lớp</label>
                    <select
                      value={formData.classId}
                      onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    >
                      <option value="">-- Chưa xếp lớp --</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          Lớp {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Mã Thẻ RFID</label>
                    <input
                      type="text"
                      value={formData.rfidCode}
                      onChange={(e) => setFormData({ ...formData, rfidCode: e.target.value })}
                      placeholder="RFID_2025_XX"
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <p className="font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Thông tin Phụ huynh
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">Tên Phụ huynh</label>
                      <input
                        type="text"
                        value={formData.parentName}
                        onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                        placeholder="Nguyễn Văn B"
                        className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Số điện thoại</label>
                      <input
                        type="text"
                        value={formData.parentPhone}
                        onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                        placeholder="0912345678"
                        className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-2">
                  <PillButton
                    type="button"
                    variant="ghost"
                    onClick={() => setShowAddModal(false)}
                  >
                    Hủy bỏ
                  </PillButton>
                  <PillButton type="submit" variant="primary">
                    Lưu hồ sơ
                  </PillButton>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
