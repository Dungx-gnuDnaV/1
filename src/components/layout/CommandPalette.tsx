"use client";

import React, { useState, useEffect } from "react";
import { Search, GraduationCap, Users, Calendar, Award, FileText, X, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = Router();

  function Router() {
    return useRouter();
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open triggered by parent state
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results || []);
      } catch (err) {
        console.error("Search error", err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/40 backdrop-blur-md transition-opacity">
      <div className="w-full max-w-xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-2xl">
        {/* Search Input Header */}
        <div className="flex items-center px-4 border-b border-slate-200 dark:border-slate-800">
          <Search size={20} className="text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm học sinh, mã HS, lớp học, giáo viên, thông báo..."
            className="w-full px-3 py-4 text-sm bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
            autoFocus
          />
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X size={18} />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-1">
          {loading && (
            <div className="p-6 text-center text-xs text-slate-400">Đang tìm kiếm dữ liệu...</div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="p-6 text-center text-xs text-slate-400">Không tìm thấy kết quả phù hợp.</div>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-1">
              {results.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    router.push(item.url);
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/80 text-left transition-colors group"
                >
                  <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0">
                    {item.type === "student" && <GraduationCap size={18} />}
                    {item.type === "class" && <Users size={18} />}
                    {item.type === "teacher" && <FileText size={18} />}
                    {item.type === "notice" && <Award size={18} />}
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-medium text-xs text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                      {item.title}
                    </span>
                    <span className="text-[11px] text-slate-400 truncate">{item.subtitle}</span>
                  </div>
                  <ArrowRight size={14} className="text-slate-300 group-hover:text-blue-500 shrink-0 transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          )}

          {!query && (
            <div className="p-4 space-y-3">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Gợi ý truy cập nhanh</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    router.push("/students");
                    onClose();
                  }}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  <GraduationCap size={16} className="text-blue-500" />
                  <span>Danh sách Học sinh</span>
                </button>
                <button
                  onClick={() => {
                    router.push("/attendance");
                    onClose();
                  }}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  <Calendar size={16} className="text-emerald-500" />
                  <span>Điểm danh Lớp học</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
