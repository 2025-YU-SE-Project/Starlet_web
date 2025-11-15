import React, { useMemo } from "react";
import { IoClose } from "react-icons/io5";
import ConstellationMini from "../ConstellationMini";
import bgImage from "../../assets/background.png";
import { FaPencil } from "react-icons/fa6";

import yellowColorIcon from "../../assets/Calendar/yellow.png";
import blueColorIcon from "../../assets/Calendar/blue.png";
import redColorIcon from "../../assets/Calendar/red.png";
import orangeColorIcon from "../../assets/Calendar/orange.png";
import greenColorIcon from "../../assets/Calendar/green.png";
import purpleColorIcon from "../../assets/Calendar/purple.png";

const COLOR_TO_EMOTION = {
  YELLOW: "HAPPY",
  BLUE: "SAD",
  RED: "ANGRY",
  ORANGE: "FUNNY",
  GREEN: "WOW",
  PURPLE: "CONFUSED",
};

const EMOTION_TO_COLOR = {
  HAPPY: "YELLOW",
  SAD: "BLUE",
  ANGRY: "RED",
  FUNNY: "ORANGE",
  WOW: "GREEN",
  CONFUSED: "PURPLE",
  CRYING: "BLUE",
};

const colorIconMap = {
  YELLOW: yellowColorIcon,
  BLUE: blueColorIcon,
  RED: redColorIcon,
  ORANGE: orangeColorIcon,
  GREEN: greenColorIcon,
  PURPLE: purpleColorIcon,
};

const EMOTIONS = [
  { key: "HAPPY", label: "행복해요" },
  { key: "SAD", label: "슬퍼요" },
  { key: "ANGRY", label: "화나요" },
  { key: "FUNNY", label: "웃겨요" },
  { key: "WOW", label: "놀라워요" },
  { key: "CONFUSED", label: "혼란스러워요" },
];

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
  const found = EMOTIONS.find((v) => v.key === e);
  return found ? found.label : e || "-";
}

export default function ConstellationDetailModal({
  open,
  onClose,
  detail,
  initial,
}) {
  if (!open) return null;

  const model = detail || initial || {};
  const { name, description, date, stars = [], connections = [] } = model;

  /* 별에서 감정 추론: 명시적 필드 우선, 없으면 색상->감정 매핑 사용 */
  function resolveEmotionFromStar(s) {
    const explicit = s.emotion || s.emotionType || s.mood;
    if (explicit) return explicit;
    const colorKey = (s.color || "").toUpperCase();
    return COLOR_TO_EMOTION[colorKey] || null;
  }

  const counts = useMemo(() => {
    const fromFields = Object.fromEntries(
      EMOTIONS.map((e) => [
        e.key,
        pick(model, [`${e.key.toLowerCase()}Count`, `${e.key}Count`], null),
      ])
    );

    const needCalc = Object.values(fromFields).some((v) => v == null);
    if (!needCalc) return fromFields;

    const agg = Object.fromEntries(EMOTIONS.map((e) => [e.key, 0]));
    (stars || []).forEach((s) => {
      const e = resolveEmotionFromStar(s);
      if (e && agg[e] != null) agg[e] += 1;
    });
    return EMOTIONS.reduce((acc, e) => {
      acc[e.key] = fromFields[e.key] ?? agg[e.key];
      return acc;
    }, {});
  }, [model, stars]);

  return (
    <div className="fixed inset-0 z-[100]">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                      bg-white text-neutral-900 w-[960px] max-w-[95vw] rounded-2xl shadow-2xl"
      >
        {/* 헤더 */}
        <div className="flex gap-6 p-8">
          {/* 별 썸네일 */}
          <div
            className="rounded-2xl overflow-hidden mt-5"
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
                <div className="text-neutral-500 text-sm mt-5">
                  {formatKDate(date)}
                </div>
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
              {EMOTIONS.map((em) => {
                const colorKey = EMOTION_TO_COLOR[em.key] || "YELLOW";
                const iconSrc = colorIconMap[colorKey];
                const cnt = counts[em.key] || 0;
                return (
                  <div key={em.key} className="flex items-center gap-3">
                    <span className="w-32 text-xl">{em.label}</span>
                    <div className="flex items-center">
                      {Array.from({ length: Math.min(6, cnt) }).map(
                        (_, idx) => (
                          <img
                            key={idx}
                            src={iconSrc}
                            alt={`${em.label} (${colorKey})`}
                            className="w-8 h-8"
                          />
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className=" bg-neutral-50" />

        <div className="p-6">
          <div className="font-semibold mb-3 text-[#4F4F4F]/80 text-xl">
            내가 남긴 기록 보기
          </div>

          <div className="border border-[#F4F4F4] rounded-xl overflow-hidden">
            <div className="grid grid-cols-3 bg-[#DFDFDF] px-12 py-3">
              <div>별</div>
              <div>감정</div>
              <div>생성 날짜</div>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-[#D9D9D9]">
              {(stars || []).map((s) => {
                const colorKey = (s.color || "").toUpperCase();
                const icon = colorIconMap[colorKey] || yellowColorIcon;
                const e = resolveEmotionFromStar(s);
                return (
                  <div
                    key={s.starId}
                    className="grid grid-cols-3 items-center px-6 py-3 bg-[#EBEBEB]/50"
                  >
                    <img
                      src={icon}
                      alt={colorKey || "COLOR"}
                      className="w-8 h-8 ml-4"
                    />
                    <div>{emotionLabel(e)}</div>
                    <div>{formatKDate(s.date)}</div>
                  </div>
                );
              })}
              {(!stars || stars.length === 0) && (
                <div className="px-6 py-8 text-neutral-500 text-sm">
                  기록이 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
