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

const TAGS = ["가족", "연인", "친구", "여행", "공부", "취미"];

function EmotionModal({
  open,
  initialEmotion = "",
  initialTags = [],
  onClose,
  onPick,
}) {
  const [emotion, setEmotion] = useState(initialEmotion);
  const [tags, setTags] = useState(initialTags);

  useEffect(() => {
    if (open) {
      setEmotion(initialEmotion);
      setTags(initialTags);
    }
  }, [open, initialEmotion, initialTags]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, [open]);

  if (!open) return null;

  const toggleTag = (t) =>
    setTags((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );

  const canSubmit = Boolean(emotion) && tags.length > 0;

  const handleNext = () => {
    if (!canSubmit) return;
    onPick?.(emotion, tags);
  };

  function Item({ item }) {
    const active = emotion === item.id;

    return (
      <button
        type="button"
        onClick={() => setEmotion(item.id)}
        className={`w-full rounded-xl px-6 py-5 transition flex items-center gap-5 ${
          active ? "bg-gray-300" : "bg-[#F4F4F4] hover:bg-gray-200"
        } text-black`}
      >
        <img
          src={item.icon}
          alt={item.title}
          className="w-16 h-16 object-contain shrink-0"
          draggable={false}
        />
        <div className="text-left">
          <div className="text-[18px] font-extrabold text-gray-800">
            {item.title}
          </div>
          <div className="text-[14px] text-[#808080] mt-1">{item.desc}</div>
        </div>
      </button>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60" onClick={onClose} />
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose?.();
        }}
      >
        <div
          className="w-full max-w-5xl max-h-[90vh] overflow-auto rounded-[10px] bg-[#F4F4F4]"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="relative px-12 pt-14 pb-6">
            <button
              onClick={handleNext}
              disabled={!canSubmit}
              className={`absolute right-10 top-6 text-[20px] font-medium ${
                canSubmit
                  ? "text-[#18315D] hover:opacity-80 cursor-pointer "
                  : "text-[#808080]"
              }`}
            >
              다음
            </button>
            <span className="text-[40px] font-extrabold text-[#808080]">
              오늘의 감정은 ?
            </span>
            <div className="w-full h-[2.5px] bg-[#808080]/55 mt-4" />
          </div>

          <div className="px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-8 text-[18px]">
              {EMOTIONS.map((it) => (
                <Item key={it.id} item={it} />
              ))}
            </div>
          </div>

          <div className="px-8 pt-12 pb-10">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 justify-items-center">
              {TAGS.map((t) => {
                const active = tags.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTag(t)}
                    className={`w-fit px-7 py-1 rounded-[10px] border text-[15px] transition ${
                      active
                        ? "bg-[#BCBCBC] border-[#BCBCBC] text-black"
                        : "bg-[#D9D9D9] border-[#D9D9D9] text-black hover:bg-[#CFCFCF]"
                    }`}
                    title={`#${t}`}
                  >
                    #{t}
                  </button>
                );
              })}
            </div>
            <div className="mt-7 text-right text-sm text-[#808080]">
              태그를 1개 이상 선택해주세요.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default EmotionModal;
