import React from "react";
import { IoClose } from "react-icons/io5";

function DiarySummary({ open, onClose, summary, loading, error, year, month }) {
  if (!open) return null;

  const monthLabel = `${year}년 ${String(month).padStart(2, "0")}월`;

  const apiMessage =
    summary?.summary ??
    summary?.message ??
    summary?.content ??
    summary?.text ??
    summary?.overview ??
    "";

  const displayText = loading
    ? "이번 달 일기를 분석하는 중입니다..."
    : error
    ? error
    : apiMessage || "이번 달 일기 요약 내용을 불러오지 못했습니다.";

  return (
    <div className="fixed inset-0 z-[70]" onClick={onClose}>
      <div
        className="absolute top-24 right-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-[360px] max-w-[90vw] rounded-[24px] bg-[#F4F4F4] text-[#333333] overflow-hidden flex flex-col">
          <div className="relative h-[50px] bg-[#D9D9D9] rounded-t-[24px] flex items-center justify-center">
            <span className="font-semibold text-[#333333]">
              이번 달 일기 분석
            </span>
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4F4F4F] hover:text-black cursor-pointer"
            >
              <IoClose className="w-5 h-5" />
            </button>
          </div>

          <div className="px-6 py-5 text-center">
            <div className="px-5 py-3 text-sm leading-relaxed text-[#111827] ">
              {displayText}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DiarySummary;
