import React, { useMemo } from "react";
import { IoClose } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import ConstellationMini from "../ConstellationMini";
import bgImage from "../../assets/background.png";

import yellowColorIcon from "../../assets/emotions/yellow.png";
import blueColorIcon from "../../assets/emotions/blue.png";
import redColorIcon from "../../assets/emotions/red.png";
import orangeColorIcon from "../../assets/emotions/orange.png";
import greenColorIcon from "../../assets/emotions/green.png";
import purpleColorIcon from "../../assets/emotions/purple.png";

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
  { key: "CONFUSED", label: "잘 모르겠어요" },
];

function pick(obj, keys, def = 0) {
  for (const k of keys) if (obj && obj[k] != null) return obj[k];
  return def;
}

function formatKDate(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (isNaN(d)) return "-";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}년 ${m}월 ${day}일`;
}

function toISODate(input) {
  if (!input) return null;
  const d = typeof input === "string" ? new Date(input) : input;
  if (isNaN(d?.getTime?.())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
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
  items = [],
  index = 0,
  onChangeIndex,
  loop = true,
}) {
  if (!open) return null;

  const navigate = useNavigate();

  const hasList = Array.isArray(items) && items.length > 0;
  const model = hasList && items?.[index] ? items[index] : (detail || initial || {});
  const { name, description, date, stars = [], connections = [] } = model || {};

  function resolveEmotionFromStar(s) {
    const explicit = s?.emotion || s?.emotionType || s?.mood;
    if (explicit) return explicit;
    const colorKey = String(s?.color || "").toUpperCase();
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

  const goCalendarWith = (anyDate) => {
    const iso = toISODate(anyDate);
    if (!iso) return;
    navigate(`/calendar?date=${iso}`);
    onClose?.();
  };

  const total = hasList ? items.length : 1;
  const canNav = total > 1;

  const goIdx = (next) => {
    if (!canNav || !onChangeIndex) return;
    const n = loop ? (next + total) % total : Math.min(Math.max(next, 0), total - 1);
    onChangeIndex(n);
  };
  const goPrev = () => goIdx(index - 1);
  const goNext = () => goIdx(index + 1);

  React.useEffect(() => {
    const onKey = (e) => {
      if (!open) return;
      if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
      if (e.key === "ArrowRight") { e.preventDefault(); goNext(); }
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, index, total]);

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />
      <div className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                      bg-white/85 text-neutral-900 w-280 max-w-[95vw] rounded-2xl shadow-2xl relative">
        {canNav && ( // 방향키 버튼으로 별자리 상세페이지 이동
          <>
            <button
              aria-label="이전 별자리"
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-[-80px] top-1/2 -translate-y-1/2
                         flex items-center justify-center select-none"
            >
              <span className="text-white text-8xl leading-none  hover:text-gray-300">‹</span>
            </button>
            <button
              aria-label="다음 별자리"
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-[-80px] top-1/2 -translate-y-1/2
                          flex items-center justify-center select-none"
            >
              <span className="text-white text-8xl leading-none hover:text-gray-300">›</span>
            </button>
          </>
        )}

        <div className="flex gap-6 px-8 pt-8">
          <div
            className="rounded-2xl overflow-hidden mt-5"
            style={{
              width: 330,
              height: 330,
              backgroundImage: `url(${bgImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <ConstellationMini
              stars={stars}
              connections={connections}
              width={300}
              height={300}
              hideBackground={true}
            />
          </div>

          <div className="flex flex-col flex-1">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-neutral-500 mt-5">{formatKDate(date)}</div>
                <div className="text-3xl font-bold mt-1">{name || ""}</div>
              </div>
              <button
                onClick={onClose}
                aria-label="닫기"
                className="p-2 rounded-full hover:bg-neutral-100 active:scale-95"
              >
                <IoClose size={40} />
              </button>
            </div>

            <div className="text-neutral-500 text-xl leading-relaxed">
              {description || "설명이 없습니다."}
            </div>

            <div className="mt-4 grid grid-rows-2 gap-y-1 font-pretendard">
              {EMOTIONS.map((em) => {
                const colorKey = EMOTION_TO_COLOR[em.key] || "YELLOW";
                const iconSrc = colorIconMap[colorKey];
                const cnt = counts[em.key] || 0;
                return (
                  <div key={em.key} className="flex items-center gap-3 ">
                    <span className="w-32 text-xl">{em.label}</span>
                    <div className="flex items-center">
                      {Array.from({ length: Math.min(6, cnt) }).map((_, idx) => (
                        <img key={idx} src={iconSrc} alt={`${em.label} (${colorKey})`} className="w-8 h-8" />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className=" bg-neutral-50" />

        <div className="p-6 font-pretendard">
          <div className="font-semibold mb-3 text-[#4F4F4F]/80 text-xl">내가 남긴 기록 보기</div>

          <div className="border border-[#d4d4d4] rounded-xl overflow-hidden">
            <div className="grid grid-cols-3 bg-[#d4d4d4] px-12 py-3 font-semibold">
              <div>별</div>
              <div>감정</div>
              <div>생성 날짜</div>
            </div>

            <div className="max-h-50 overflow-y-au>to divide-y divide-[#D9D9D9]">
              {(stars || []).map((s) => {
                const colorKey = String(s?.color || "").toUpperCase();
                const icon = colorIconMap[colorKey] || yellowColorIcon;
                const e = resolveEmotionFromStar(s);
                const key = s?.starId || s?.id;

                return (
                  <div key={key} className="grid grid-cols-3 items-center px-6 py-3 bg-[#EBEBEB]">
                    <img src={icon} alt={colorKey || "COLOR"} className="w-8 h-8 ml-4" />
                    <div className="px-2">{emotionLabel(e)}</div>

                    <div
                      className="cursor-pointer hover:underline"
                      role="button"
                      tabIndex={0}
                      aria-label="해당 날짜 일기장으로 이동"
                      onClick={() => goCalendarWith(s?.date)}
                      onKeyDown={(ev) => {
                        if (ev.key === "Enter" || ev.key === " ") goCalendarWith(s?.date);
                      }}
                    >
                      {formatKDate(s?.date)}
                    </div>
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
