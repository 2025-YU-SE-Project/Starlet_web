import React, { useEffect, useMemo, useState } from "react";
import imgBlue from "../assets/emotions/blue.png";
import imgOrange from "../assets/emotions/orange.png";
import imgRed from "../assets/emotions/red.png";
import imgSkyblue from "../assets/emotions/skyblue.png";
import imgWhite from "../assets/emotions/white.png";
import imgYellow from "../assets/emotions/yellow.png";

const STICKER = {
  funny: imgOrange,
  angry: imgRed,
  wow: imgSkyblue,
  happy: imgYellow,
  confused: imgWhite,
  crying: imgBlue,
};

const MONTH_ABBR = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

export default function DiaryModal({
  open,
  dateStr = "",
  emotionId,
  initialText = "",
  onClose,
  onSave,
  userName = "Mins",
}) {
  const [text, setText] = useState(initialText);
  const [tags, setTags] = useState([]);

  const parsed = useMemo(() => {
    if (!dateStr) return null;
    const d = new Date(dateStr + "T00:00:00");
    if (isNaN(d.getTime())) return null;
    return {
      y: d.getFullYear(),
      m: d.getMonth(),
      d: d.getDate(),
      mm: String(d.getMonth() + 1).padStart(2, "0"),
      dd: String(d.getDate()).padStart(2, "0"),
    };
  }, [dateStr]);

  useEffect(() => {
    if (open) {
      setText(initialText || "");
      setTags([]);
    }
  }, [open, initialText]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev || "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const TAGS_PRESET = ["가족", "연인", "친구", "회사", "공부", "취미"];
  const toggleTag = (t) =>
    setTags((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60" onClick={onClose} />

      <div
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose?.();
        }}
        role="dialog"
        aria-modal="true"
      >
        <div
          className="w-full max-w-5xl max-h-[90vh] overflow-auto rounded-xl bg-gray-100 shadow-2xl"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="relative px-8 pt-6 pb-4">
            <button
              onClick={() => onSave?.(text)}
              className="absolute right-6 top-6 text-lg font-semibold text-gray-700 hover:text-gray-900"
            >
              완료
            </button>

            <div className="pr-20">
              <div className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 uppercase">
                {parsed ? `${MONTH_ABBR[parsed.m]} ${parsed.y}` : ""}
              </div>
              <div className="mt-2 text-[22px] sm:text-2xl font-semibold text-gray-400">
                {parsed ? `${parsed.mm}/${parsed.dd}` : ""}{" "}
                <span className="ml-2">{userName} 의 일기장</span>
              </div>
            </div>

            <div className="h-px bg-gray-300 mt-4" />
          </div>

          <div className="px-8 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="flex flex-col items-center">
                {emotionId && STICKER[emotionId] && (
                  <img
                    src={STICKER[emotionId]}
                    alt=""
                    className="w-24 h-24 object-contain drop-shadow-md"
                    draggable={false}
                  />
                )}

                <div className="mt-10 grid grid-cols-3 grid-rows-2 gap-y-3 justify-items-center w-full max-w-[360px] mx-auto">
                  {TAGS_PRESET.slice(0, 6).map((t) => {
                    const active = tags.includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleTag(t)}
                        className={`px-6 py-2 rounded-xl border text-sm transition
                          ${
                            active
                              ? "bg-gray-300 border-gray-300 text-black"
                              : "bg-gray-200 border-gray-200 text-black hover:bg-gray-300"
                          }`}
                        title={`#${t}`}
                      >
                        #{t}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <textarea
                  rows={14}
                  className="w-full min-h-[320px] rounded-2xl border border-gray-400 bg-white p-4 text-gray-800 outline-none focus:border-gray-600 shadow-inner"
                  placeholder="오늘 하루는 어땠나요?"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
