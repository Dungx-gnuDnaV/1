"use client";

import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { PillButton } from "@/components/ui/PillButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { GraduationCap, ArrowRight, Shield, Sparkles } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [loading, setLoading] = useState(false);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="relative rounded-3xl p-8 overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 text-white shadow-xl shadow-blue-500/20">
          <div className="relative z-10 space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold">
              <Sparkles size={14} />
              <span>Hệ sinh thái Quản lý Học sinh Thông minh</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Chào mừng tới Smart SMS
            </h1>
            <p className="text-blue-100 text-sm md:text-base leading-relaxed">
              Giải pháp SaaS thế hệ mới tích hợp Trí tuệ Nhân tạo, quản lý chuyên cần RFID, bảng điểm tự động và theo dõi rèn luyện cho các trường THPT tại Việt Nam.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link href="/dashboard">
                <PillButton variant="secondary" size="lg" icon={<ArrowRight size={18} />}>
                  Truy cập Dashboard
                </PillButton>
              </Link>
              <Link href="/ai-assistant">
                <PillButton variant="outline" size="lg" className="border-white/40 text-white hover:bg-white/10">
                  Thử AI Trợ lý
                </PillButton>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
