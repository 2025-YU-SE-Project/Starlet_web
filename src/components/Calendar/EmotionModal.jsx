import React, { useEffect, useMemo, useState } from "react";
import iconFunny from "../../assets/emotions/funny.png";
import iconAngry from "../../assets/emotions/angry.png";
import iconWow from "../../assets/emotions/wow.png";
import iconHappy from "../../assets/emotions/happy.png";
import iconConfused from "../../assets/emotions/confused.png";
import iconCrying from "../../assets/emotions/crying.png";
import calendarIcon from "../../assets/emotions/calendar.png";
import emotionIcon from "../../assets/emotions/emotion.png";
import tagIcon from "../../assets/emotions/tag.png";

const EMOTIONS = [
  { id: "funny", title: "웃겨요", icon: iconFunny },
  { id: "happy", title: "행복해요", icon: iconHappy },
  { id: "wow", title: "놀라워요", icon: iconWow },
  { id: "neutral", title: "잘 모르겠어요", icon: iconConfused },
  { id: "crying", title: "슬퍼요", icon: iconCrying },
  { id: "angry", title: "화나요", icon: iconAngry },
];

const TAGS = [
  "일",
  "공부",
  "가족",
  "연인",
  "친구",
  "건강",
  "여행",
  "취미",
  "기타",
];

function EmotionModal({
  open,
  initialEmotion = "",
  initialTags = [],
  selectedDate,
  onClose,
  onPick,
  userName = "",
}) {
  const [emotion, setEmotion] = useState(initialEmotion);
  const [tags, setTags] = useState(initialTags);
  const displayName = userName || "사용자";

  const formattedDate = useMemo(() => {
    if (!selectedDate) return "";
    const dt =
      typeof selectedDate === "string" ? new Date(selectedDate) : selectedDate;
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const d = String(dt.getDate()).padStart(2, "0");
    return `${y}년 ${m}월 ${d}일`;
  }, [selectedDate]);

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

  const SectionTitle = ({ icon, title, subtitle }) => (
    <div className="flex flex-col items-start gap-1 ml-3">
      <div className="flex items-center gap-2">
        {icon}
        <div className="text-[20px] font-bold text-[#4F4F4F]">{title}</div>
      </div>
      {subtitle && (
        <div className="text-sm text-[#9F9F9F] mt-1 ml-3">{subtitle}</div>
      )}
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60" onClick={onClose} />
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose?.();
        }}
      >
        <div
          className="w-full max-w-2xl rounded-[20px] overflow-hidden bg-[#F4F4F4] text-black"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="relative h-14 bg-[#D9D9D9] flex items-center justify-center">
            <div className="text-xl font-semibold text-[#3B3B3B]">
              <span className="text-[#4F4F4F]">{displayName}</span>{" "}
              <span className="text-[#939393]">의 Diary</span>
            </div>
            <button
              onClick={handleNext}
              disabled={!canSubmit}
              className={`absolute right-4 top-1/2 -translate-y-1/2 rounded-xl px-3 py-1 font-medium transition ${
                canSubmit ? "text-[#4F4F4F] hover:text-black" : "text-[#9CA3AF]"
              }`}
            >
              다음
            </button>
          </div>

          <div className="px-6 py-6">
            <section className="py-1">
              <SectionTitle
                icon={
                  <img
                    src={calendarIcon}
                    alt="calendar"
                    className="w-6 h-6 object-contain opacity-90 ml-3"
                    draggable={false}
                  />
                }
                title="생성 날짜"
              />

              <div className="mt-3">
                <div className="inline-flex items-center ml-3 px-4 py-2 rounded-[20px] bg-[#D9D9D9]">
                  <span className="text-sm text-[#3B3B3B] font-medium">
                    {formattedDate}
                  </span>
                </div>
              </div>

              <div className="my-5 h-[2px] bg-[#CCCCCC]" />
            </section>

            <section className="py-1">
              <SectionTitle
                icon={
                  <img
                    src={emotionIcon}
                    alt="emotion"
                    className="w-8 h-8 object-contain opacity-90 ml-3"
                    draggable={false}
                  />
                }
                title="감정 선택"
                subtitle="오늘의 감정을 선택해주세요"
              />

              <div className="mt-2 grid grid-cols-3 sm:grid-cols-6 place-items-center">
                {EMOTIONS.map((e) => {
                  const active = e.id === emotion;
                  return (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => setEmotion(e.id)}
                      className="group w-[80px] flex flex-col items-center focus:outline-none"
                    >
                      <div
                        className={`flex items-center justify-center w-[60px] h-[60px] rounded-full transition ${
                          active
                            ? "bg-[#D9D9D9] border-[#D9D9D9]"
                            : "bg-[#F3F4F6] border-[#D1D5DB] group-hover:border-[#9CA3AF]"
                        }`}
                      >
                        <img
                          src={e.icon}
                          alt={e.title}
                          className="w-11 h-11 "
                          draggable={false}
                        />
                      </div>
                      <div
                        className={` text-[13px] font-medium ${
                          active ? "text-black" : "text-black"
                        }`}
                      >
                        {e.title}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="my-5 h-[2px] bg-[#CCCCCC]" />
            </section>

            <section className="py-1">
              <SectionTitle
                icon={
                  <img
                    src={tagIcon}
                    alt="tag"
                    className="w-7 h-7 object-contain opacity-90 ml-3"
                    draggable={false}
                  />
                }
                title="태그 선택"
                subtitle="오늘의 태그를 선택해주세요"
              />

              <div className="mt-4 flex flex-col gap-3 ml-6">
                <div className="flex flex-wrap gap-4">
                  {TAGS.slice(0, 5).map((t) => {
                    const active = tags.includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleTag(t)}
                        className={`px-4 py-2 rounded-full border text-sm transition ${
                          active
                            ? "bg-[#BFBFBF] border-[#BFBFBF] text-[#111827]"
                            : "bg-[#D9D9D9] border-[#D9D9D9] text-[#4F4F4F] hover:bg-[#C9C9C9]"
                        }`}
                      >
                        #{t}
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap gap-4">
                  {TAGS.slice(5).map((t) => {
                    const active = tags.includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleTag(t)}
                        className={`px-4 py-2 rounded-full border text-sm transition ${
                          active
                            ? "bg-[#BFBFBF] border-[#BFBFBF] text-[#111827]"
                            : "bg-[#D9D9D9] border-[#D9D9D9] text-[#4F4F4F] hover:bg-[#C9C9C9]"
                        }`}
                      >
                        #{t}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 ml-7 text-sm text-[#9F9F9F]">
                * 태그를 1개 이상 선택해주세요
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}

export default EmotionModal;
