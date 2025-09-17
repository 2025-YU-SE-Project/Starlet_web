import React, { useEffect, useState } from "react";
import iconFunny from "../assets/emotions/funny.png";
import iconAngry from "../assets/emotions/angry.png";
import iconWow from "../assets/emotions/wow.png";
import iconHappy from "../assets/emotions/happy.png";
import iconConfused from "../assets/emotions/confused.png";
import iconCrying from "../assets/emotions/crying.png";

const EMOTIONS = [
  { id: "funny", title: "웃겨요", desc: "유쾌한 일이 가득했어요~", icon: iconFunny },
  { id: "angry", title: "화나요", desc: "짜증나고 속상한 일이 많았어요", icon: iconAngry },
  { id: "wow", title: "놀라워요!", desc: "예상 못한 일이 많았어요!", icon: iconWow },
  { id: "happy", title: "행복해요!", desc: "아주 기분 좋은 하루였어요", icon: iconHappy },
  { id: "confused", title: "잘 모르겠어요", desc: "감정이 복잡하고 알 수 없는 하루였어요", icon: iconConfused },
  { id: "crying", title: "슬퍼요 ㅠㅠ", desc: "눈물 날 것 같은 하루였어요", icon: iconCrying },
];

function EmotionModal({ open, initialEmotion = "", onClose, onPick }) {
  const [emotion, setEmotion] = useState(initialEmotion);

  useEffect(() => {
    if (open) setEmotion(initialEmotion);
  }, [open, initialEmotion]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, [open]);

  if (!open) return null;

  const Item = ({ item }) => {
    const active = emotion === item.id;
    return (
      <button
        type="button"
        onClick={() => setEmotion(item.id)}
        className={`group w-full flex items-center gap-4 px-10 py-3 rounded-lg transition
          ${active ? "bg-gray-300  text-black" : "bg-[#F4F4F4]  text-black "}`}
      >
        <img src={item.icon} alt={item.title} className="w-16 h-16 object-contain" />
        <span className="text-left">
          <div className="font-extrabold text-gray-800">{item.title}</div>
          <div className="text-[15px] text-[#808080] mt-1">{item.desc}</div>
        </span>
      </button>
    );
  };

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
          className="w-full max-w-5xl max-h-[90vh] overflow-auto rounded-[10px] bg-[#F4F4F4] "
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="relative px-12 pt-[90px] pb-6">
            <button
              onClick={() => emotion && onPick?.(emotion)}
              disabled={!emotion}
              className={`absolute right-10 top-6 text-[20px] font-medium ${
                emotion ? "text-[#18315D] hover:text-[#18315D] cursor-pointer" : "text-[#808080]"
              }`}
            >
              다음
            </button>
            <span className="text-[40px] font-extrabold text-[#808080]">오늘의 감정은 ?</span>
            <div className="w-full h-[2.5px] bg-[#808080]/55 mt-4" />
          </div>
          <div className="px-8 pb-20">
            <div className="text-[20px] grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
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

export default EmotionModal;
