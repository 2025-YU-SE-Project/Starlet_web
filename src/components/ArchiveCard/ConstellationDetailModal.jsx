import React, { useMemo } from "react";
import { IoClose } from "react-icons/io5";
import ConstellationMini from "../ConstellationMini";
import bgImage from "../../assets/background.png";


import yellowIcon from "../../assets/emotions/yellow.png";
import blueIcon from "../../assets/emotions/blue.png";
import redColorIcon from "../../assets/emotions/red.png";
import orangeIcon from "../../assets/emotions/orange.png";
import whiteIcon from "../../assets/emotions/white.png";
import skyblueIcon from "../../assets/emotions/skyblue.png";

const COLOR_TO_EMOTION = {
  YELLOW: "HAPPY",
  BLUE: "SAD",
  RED: "ANGRY",
  ORANGE: "FUNNY",
  SKYBLUE: "SAD",
  WHITE: null,   // 화이트는 특정 감정 없음 (원하면 다른 값으로 설정)
};

const colorIconMap = {
  YELLOW: yellowIcon,
  BLUE: blueIcon,
  RED: redColorIcon,
  ORANGE: orangeIcon,
  WHITE: whiteIcon,
  SKYBLUE: skyblueIcon,
};


function pick(obj, keys, def = 0) {
  for (const k of keys) {
    if (obj && obj[k] != null) return obj[k];
  }
  return def;
}

function formatKDate(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}년 ${m}월 ${day}일`;
}

function emotionLabel(e) {
  switch (e) {
    case "HAPPY": return "행복해요";
    case "SAD": return "슬퍼요";
    case "ANGRY": return "화나요";
    case "FUNNY": return "웃겨요";
    default: return e || "-";
  }
}

const emotionChip = [
  { key: "HAPPY",  label: "행복해요", icon: yellowIcon,  fallbackColor: "YELLOW"  },
  { key: "SAD",    label: "슬퍼요",   icon: blueIcon, fallbackColor: "BLUE"    },
  { key: "ANGRY",  label: "화나요",   icon: redColorIcon,    fallbackColor: "RED"     },
  { key: "FUNNY",  label: "웃겨요",   icon: orangeIcon,  fallbackColor: "ORANGE"  },
  
];

export default function ConstellationDetailModal({
  open,
  onClose,
  detail,  
  initial,  
}) {
  if (!open) return null;

  const model = detail || initial || {};
  const {
    constellationId,
    name,
    description,
    date,
    stars = [],
    connections = [],
  } = model;

  function resolveEmotionFromStar(s) {
  const explicit = s.emotion || s.emotionType || s.mood;
  if (explicit) return explicit;
  const colorKey = (s.color || "").toUpperCase();
  return COLOR_TO_EMOTION[colorKey] || null;
}

  // 감정 카운트 계산
  const counts = useMemo(() => {
    const fromFields = {
      HAPPY: pick(model, ["happinessCount", "happyCount", "happynessCount"], null),
      SAD: pick(model, ["sadnessCount", "sadCount"], null),
      ANGRY: pick(model, ["angerCount", "angryCount"], null),
      FUNNY: pick(model, ["funnyCount", "laughCount", "wowCount"], null),
    };

    const needCalc = Object.values(fromFields).some(v => v == null);
    if (!needCalc) return fromFields;

    const agg = { HAPPY: 0, SAD: 0, ANGRY: 0, FUNNY: 0 };
    (stars || []).forEach(s => {
     const e =
    s.emotion ||
    s.emotionType ||
    s.mood ||
    COLOR_TO_EMOTION[s.color] ||
    null;
      if (e && agg[e] != null) agg[e] += 1;
    });
    return {
      HAPPY: fromFields.HAPPY ?? agg.HAPPY,
      SAD: fromFields.SAD ?? agg.SAD,
      ANGRY: fromFields.ANGRY ?? agg.ANGRY,
      FUNNY: fromFields.FUNNY ?? agg.FUNNY,
    };
  }, [model, stars]);

  return (
    <div className="fixed inset-0 z-[100]">

      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* 모달 */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                      bg-white text-neutral-900 w-[960px] max-w-[95vw] rounded-2xl shadow-2xl">
        {/* 헤더 */}
        <div className="flex gap-6 p-8">
          {/* 별 썸네일 */}
          <div
   className="rounded-2xl overflow-hidden"
   style={{
     width: 280,
     height: 280,
     backgroundImage: `url(${bgImage})`,
     backgroundSize: "cover",
     backgroundPosition: "center",
   }}
 >
   <ConstellationMini
     stars={stars}
     connections={connections}
     width={280}
     height={280}
     hideBackground={true}   
   />
 </div>

     
          <div className="flex flex-col flex-1 gap-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-neutral-500 text-sm mt-5">{formatKDate(date)}</div>
                <div className="text-3xl font-bold mt-1">{name}</div>
              </div>
              <button
                onClick={onClose}
                aria-label="닫기"
                className="p-2 rounded-full hover:bg-neutral-100 active:scale-95"
              >
                <IoClose size={40} />
              </button>
            </div>

            <div className="text-neutral-500 leading-relaxed">
              {description || "설명이 없습니다."}
            </div>

        
            <div className="mt-4 grid grid-rows-2 gap-y-2">
              {emotionChip.map(ch => (
                <div key={ch.key} className="flex items-center gap-3">
                  <span className="w-24 text-xl flex">{ch.label}</span>
                  <div className="flex items-center">
               
                    {Array.from({ length: Math.min(6, counts[ch.key] || 0) }).map((_, idx) => (
                      <img
                        key={idx}
                        src={ch.icon}
                        alt={ch.label}
                        className="w-8 h-8"
                      />
                    ))}
                   
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>


        <div className=" bg-neutral-50" />

    
        <div className="p-6">
          <div className="font-semibold mb-3 text-[#4F4F4F]/80">내가 남긴 기록 보기</div>

          <div className="border border-[#F4F4F4] rounded-xl overflow-hidden">
      
            <div className="grid grid-cols-3 bg-[#DFDFDF] px-12 py-3">
              <div>별</div>
              <div>감정</div>
              <div>생성 날짜</div>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-[#D9D9D9]">
              {(stars || []).map((s) => {
                const icon = colorIconMap[s.color] || whiteIcon;
               const e = resolveEmotionFromStar(s);
                return (
                  <div key={s.starId} className="grid grid-cols-3 items-center px-6 py-3 bg-[#EBEBEB]/50">
                   
                      <img src={icon} alt={s.color} className="w-8 h-8 ml-4" />
                    
                    <div>{emotionLabel(e)}</div>
                    <div>{formatKDate(s.date)}</div>
                  </div>
                );
              })}
              {(!stars || stars.length === 0) && (
                <div className="px-6 py-8 text-neutral-500 text-sm">기록이 없습니다.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
