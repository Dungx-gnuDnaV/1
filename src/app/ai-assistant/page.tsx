"use client";

import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { PillButton } from "@/components/ui/PillButton";
import { PillBadge } from "@/components/ui/PillBadge";
import { Bot, Send, Sparkles, User, Database, RefreshCw } from "lucide-react";

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<any[]>([
    {
      sender: "ai",
      text: "Xin chào! Tôi là Trợ lý AI Trường học Smart SMS. Tôi có thể giúp bạn tra cứu sĩ số, chuyên cần, phân tích điểm số hoặc tổng hợp báo cáo thi đua. Bạn cần hỗ trợ gì hôm nay?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: data.reply,
          isSimulated: data.isAiSimulated,
        },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Rất tiếc, đã có lỗi kết nối với dịch vụ AI. Vui lòng thử lại sau." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Bot className="text-violet-600" />
              AI Trợ lý Trường học
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Hỏi đáp dữ liệu chuyên cần, điểm số, thi đua và hỗ trợ giáo viên bằng Trí tuệ Nhân tạo.
            </p>
          </div>
          <PillBadge variant="purple" size="md">
            <Sparkles size={12} className="mr-1" />
            Live DB RAG
          </PillBadge>
        </div>

        {/* Chat Interface Container */}
        <GlassCard className="p-4 flex flex-col h-[550px]">
          <div className="flex-1 overflow-y-auto space-y-4 p-2">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.sender === "ai" && (
                  <div className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-violet-500/20">
                    <Bot size={16} />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl p-3.5 text-xs leading-relaxed whitespace-pre-wrap ${
                    m.sender === "user"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20"
                      : "bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60"
                  }`}
                >
                  {m.text}
                  {m.isSimulated && (
                    <span className="block mt-2 text-[10px] text-violet-500 dark:text-violet-400 italic">
                      * Trả lời được phân tích trực tiếp từ dữ liệu CSDL thực thời gian thực.
                    </span>
                  )}
                </div>
                {m.sender === "user" && (
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <User size={16} />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 justify-start items-center text-xs text-slate-400 p-2">
                <Bot size={16} className="animate-spin text-violet-500" />
                <span>AI đang truy vấn CSDL và phân tích câu trả lời...</span>
              </div>
            )}
          </div>

          {/* Prompt Suggestion Chips */}
          <div className="py-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setInput("Hôm nay có bao nhiêu học sinh vắng mặt?")}
              className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-violet-50 text-[11px] font-medium text-slate-600 dark:text-slate-300 shrink-0"
            >
              📊 Tình hình vắng mặt hôm nay?
            </button>
            <button
              onClick={() => setInput("Điểm trung bình toàn trường hiện tại là bao nhiêu?")}
              className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-violet-50 text-[11px] font-medium text-slate-600 dark:text-slate-300 shrink-0"
            >
              📈 Điểm trung bình học kỳ II?
            </button>
            <button
              onClick={() => setInput("Bảng xếp hạng thi đua tuần này thế nào?")}
              className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-violet-50 text-[11px] font-medium text-slate-600 dark:text-slate-300 shrink-0"
            >
              🏆 Bảng xếp hạng thi đua?
            </button>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="flex items-center gap-2 pt-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập câu hỏi dành cho Trợ lý AI..."
              className="flex-1 px-4 py-2.5 rounded-full bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-violet-500"
            />
            <PillButton type="submit" variant="primary" icon={<Send size={14} />} disabled={loading}>
              Gửi
            </PillButton>
          </form>
        </GlassCard>
      </div>
    </AppLayout>
  );
}
