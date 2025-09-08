import React, { useEffect, useState } from "react";
import iconFunny from "../assets/emotions/funny.png";
import iconAngry from "../assets/emotions/angry.png";
import iconWow from "../assets/emotions/wow.png";
import iconHappy from "../assets/emotions/happy.png";
import iconConfused from "../assets/emotions/confused.png";
import iconCrying from "../assets/emotions/crying.png";

const EMOTIONS = [
  {
    id: "funny",
    title: "웃겨요",
    desc: "유쾌한 일이 가득했어요~",
    icon: iconFunny,
  },
  {
    id: "angry",
    title: "화나요",
    desc: "짜증나고 속상한 일이 많았어요",
    icon: iconAngry,
  },
  {
    id: "wow",
    title: "놀라워요!",
    desc: "예상 못한 일이 많았어요!",
    icon: iconWow,
  },
  {
    id: "happy",
    title: "행복해요!",
    desc: "아주 기분 좋은 하루였어요",
    icon: iconHappy,
  },
  {
    id: "confused",
    title: "잘 모르겠어요",
    desc: "감정이 복잡하고 알 수 없는 하루였어요",
    icon: iconConfused,
  },
  {
    id: "crying",
    title: "슬퍼요 ㅠㅠ",
    desc: "눈물 날 것 같은 하루였어요",
    icon: iconCrying,
  },
];

export default function EmotionModal({
  open,
  initialEmotion = "",
  onClose,
  onPick,
  userInitial,
}) {
  const [emotion, setEmotion] = useState(initialEmotion);

  useEffect(() => {
    if (open) setEmotion(initialEmotion);
  }, [open, initialEmotion]);

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

  const Item = ({ item }) => {
    const active = emotion === item.id;
    return (
      <button
        type="button"
        onClick={() => setEmotion(item.id)}
        className={`group w-full flex items-center gap-4 px-2 py-3 rounded-lg transition
          ${
            active
              ? "bg-gray-300  text-black"
              : "bg-gray-100  text-black hover:bg-gray-300"
          }`}
      >
        <img
          src={item.icon}
          alt={item.title}
          className="w-16 h-16 object-contain"
        />
        <span className="text-left">
          <div className="font-extrabold tracking-tight text-slate-800">
            {item.title}
          </div>
          <div className="text-sm text-slate-500 mt-1">{item.desc}</div>
        </span>
      </button>
    );
  };

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
        {/* DairyModal과 크기 통일해야함.. */}
        <div
          className="w-full max-w-5xl max-h-[90vh] overflow-auto rounded-xl bg-gray-100 shadow-2xl"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="relative px-8 pt-6 pb-4">
            <button
              onClick={() => emotion && onPick?.(emotion)}
              disabled={!emotion}
              className={`absolute right-6 top-6 text-lg font-semibold ${
                emotion ? "text-gray-800 hover:text-gray-900" : "text-gray-400"
              }`}
            >
              다음
            </button>

            {userInitial && (
              <div className="absolute left-1/2 -translate-x-1/2 -top-6">
                <div className="rounded-full bg-emerald-500 text-white w-10 h-10 flex items-center justify-center shadow-lg ring-2 ring-white">
                  {userInitial}
                </div>
              </div>
            )}

            <h2 className="text-3xl font-extrabold tracking-tight text-gray-700">
              오늘의 감정은 ?
            </h2>
            <div className="h-px bg-gray-300 mt-4" />
          </div>

          <div className="px-8 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              {EMOTIONS.map((it) => (
                <Item key={it.id} item={it} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
