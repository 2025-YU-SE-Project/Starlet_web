
import React, { useMemo, useState } from "react";
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

import ConstellationModal from "../ConstellationModal";
import updateConstellation from "../../apis/updateConstellation";
import getConstellationArchive from "../../apis/getConstellationArchive";

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

function toDate(input) {
  if (!input) return null;
  if (input instanceof Date) return isNaN(input.getTime()) ? null : input;

  if (typeof input === "number") {
    const d = new Date(input);
    return isNaN(d.getTime()) ? null : d;
  }

  if (typeof input === "string") {
    const s0 = input.trim();
    if (!s0) return null;

    const s =
      s0.length >= 10
        ? s0.slice(0, 10).replace(/[./]/g, "-")
        : s0.replace(/[./]/g, "-");

    const d = new Date(s);
    if (!isNaN(d.getTime())) return d;

    const d2 = new Date(s0);
    return isNaN(d2.getTime()) ? null : d2;
  }

  return null;
}

function formatKDate(input) {
  const d = toDate(input);
  if (!d) return "-";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}년 ${m}월 ${day}일`;
}

function toISODate(input) {
  const d = toDate(input);
  if (!d) return null;
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
  onUpdated,
}) {
  if (!open) return null;


  const [editOpen, setEditOpen] = useState(false);
  const [editInitial, setEditInitial] = useState(null);
  const [editStars, setEditStars] = useState([]);
 const [localPatched, setLocalPatched] = useState(null); 
  const navigate = useNavigate();

  const hasList = Array.isArray(items) && items.length > 0;
  const listItem = hasList && items?.[index] ? items[index] : initial || {};

  const detailed =
    detail && detail.constellation ? detail.constellation : detail;

  const idOf = (x) => x?.constellationId ?? x?.id;
  const same =
    detailed && listItem && idOf(detailed) && idOf(detailed) === idOf(listItem);

  let model = same ? { ...listItem, ...detailed } : listItem ?? detailed ?? {};

 if (localPatched) {
   if (localPatched.name != null) model.name = localPatched.name;
   if (localPatched.description != null)
     model.description = localPatched.description;
 }

  const { name, description, stars = [], connections = [] } = model;

  const total = hasList ? items.length : 0;
  const canNav = total > 1;

  const goIdx = (next) => {
    if (!canNav || !onChangeIndex) return;
    const n = loop
      ? (next + total) % total
      : Math.min(Math.max(next, 0), total - 1);
    onChangeIndex(n);
  };
  const goPrev = () => goIdx(index - 1);
  const goNext = () => goIdx(index + 1);

  React.useEffect(() => {
    const onKey = (e) => {
      if (!open) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, index, total]);

  function resolveEmotionFromStar(s) {
    const explicit = s?.emotion || s?.emotionType || s?.mood;
    if (explicit) return explicit;
    const colorKey = (s?.color || "").toUpperCase();
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

  const headerDate =
    model?.date ??
    model?.createdAt ??
    model?.constellationCreatedAt ??
    (Array.isArray(stars) && stars[0]?.date) ??
    null;

  const getRowDate = (s) =>
    s?.date ??
    s?.createdAt ??
    s?.created_at ??
    s?.createdDate ??
    s?.created_date ??
    s?.dateStr ??
    model?.createdAt ??
    model?.constellationCreatedAt ??
    null;

 const handleOpenEdit = async () => {

  const archiveId = model?.id ?? model?.constellationId;
  if (!archiveId) {
    console.warn("archiveId가 없습니다.", model);
    return;
  }

  try {
    const data = await getConstellationArchive(archiveId);

    const mappedStars = (data.stars || []).map((s) => ({
      id: s.starId,
      color: String(s.color || "").toUpperCase(),
      x: s.x,
      y: s.y,
      date: s.date,
    }));

    const lines = (data.connections || []).map((c) => [
      String(c.startStarId),
      String(c.endStarId),
    ]);

    setEditStars(mappedStars);
    setEditInitial({
      id: data.constellationId,     
      name: data.name ?? "",
      description: data.description ?? "",
      lines,
      constellationCreatedAt: data.date ?? headerDate,
    });

    setEditOpen(true);
  } catch (e) {
    console.error("아카이브 불러오기 실패:", e);
    alert("별자리 정보를 불러오는 중 오류가 발생했어요.");
  }
};

  return (
    <div className="fixed inset-0 z-[100]">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                    bg-white/85 text-neutral-900 w-280 max-w-[95vw] rounded-2xl shadow-2xl relative"
      >
        {canNav && (
          <>
            <button
              aria-label="이전 별자리"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              className="absolute left-[-80px] top-1/2 -translate-y-1/2 flex items-center justify-center select-none"
            >
              <span className="text-white text-8xl leading-none hover:text-gray-300">
                ‹
              </span>
            </button>
            <button
              aria-label="다음 별자리"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              className="absolute right-[-80px] top-1/2 -translate-y-1/2 flex items-center justify-center select-none"
            >
              <span className="text-white text-8xl leading-none hover:text-gray-300">
                ›
              </span>
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
                <div className="text-neutral-500 mt-5">
                  {formatKDate(headerDate)}
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

            <div className="text-neutral-500 text-xl leading-relaxed">
              {description || "설명이 없습니다."}
            </div>

            <div className="mt-4 grid grid-rows-2 gap-y-1 font-pretendard">
              {EMOTIONS.map((em) => {
                const colorKey = EMOTION_TO_COLOR[em.key] || "YELLOW";
                const iconSrc = colorIconMap[colorKey];
                const cnt = counts[em.key] || 0;
                return (
                  <div
                    key={em.key}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-32 text-[18px]">{em.label}</span>
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

                    {em.key === "CONFUSED" && (
                      <button
                        type="button"
                        onClick={handleOpenEdit}
                        className="flex items-center gap-1 text-[18px] text-[#808080]"
                      >
                        <span>수정</span>
                        <span>✎</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-neutral-50" />

        <div className="p-6 font-pretendard">
          <div className="font-semibold mb-3 text-[#4F4F4F]/80 text-xl">
            내가 남긴 기록 보기
          </div>

          <div className="border border-[#d4d4d4] rounded-xl overflow-hidden">
            <div className="grid grid-cols-3 bg-[#d4d4d4] px-12 py-3 font-semibold">
              <div>별</div>
              <div>감정</div>
              <div>생성 날짜</div>
            </div>

            <div className="max-h-50 overflow-y-auto divide-y divide-[#D9D9D9]">
              {(stars || []).map((s) => {
                const colorKey = (s?.color || "").toUpperCase();
                const icon = colorIconMap[colorKey] || yellowColorIcon;
                const e = resolveEmotionFromStar(s);
                const key = s?.starId || s?.id;
                const rowDate = getRowDate(s);

                return (
                  <div
                    key={key}
                    className="grid grid-cols-3 items-center px-6 py-3 bg-[#EBEBEB]"
                  >
                    <img
                      src={icon}
                      alt={colorKey || "COLOR"}
                      className="w-8 h-8 ml-4"
                    />
                    <div className="px-2">{emotionLabel(e)}</div>

                    <div
                      className="cursor-pointer hover:underline"
                      role="button"
                      tabIndex={0}
                      aria-label="해당 날짜 일기장으로 이동"
                      onClick={() => goCalendarWith(rowDate)}
                      onKeyDown={(ev) => {
                        if (ev.key === "Enter" || ev.key === " ")
                          goCalendarWith(rowDate);
                      }}
                    >
                      {formatKDate(rowDate)}
                    </div>
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

      {/* 별자리 이름/설명 수정 모달 */}
      <ConstellationModal
        open={editOpen && !!editInitial}
        onClose={() => setEditOpen(false)}
        mode="edit"
        initial={editInitial || {}}
        stars={editStars}
        colorImageMap={colorIconMap}
        onSubmit={async ({ id, name, description }) => {
          try {
            await updateConstellation(id, { name, description });

            onUpdated?.({ id, name, description });

         
           setLocalPatched({ name, description });
       
           setEditInitial((prev) =>
             prev ? { ...prev, name, description } : prev
           );
          } catch (e) {
            console.error("별자리 수정 실패:", e);
            alert("별자리 수정 중 오류가 발생했어요.");
          } finally {
            setEditOpen(false);
          }
        }}
      />
    </div>
  );
}
