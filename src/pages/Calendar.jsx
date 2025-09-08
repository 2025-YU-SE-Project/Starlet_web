import React, { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import wallpaper from "../assets/background.png";
import Sidebar from "../Sidebar";
import EmotionModal from "../components/EmotionModal";
import DiaryModal from "../components/DiaryModal";

import imgBlue from "../assets/emotions/blue.png";
import imgOrange from "../assets/emotions/orange.png";
import imgRed from "../assets/emotions/red.png";
import imgSkyblue from "../assets/emotions/skyblue.png";
import imgWhite from "../assets/emotions/white.png";
import imgYellow from "../assets/emotions/yellow.png";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const CAL_IMAGE = {
  funny: imgOrange,
  angry: imgRed,
  wow: imgSkyblue,
  happy: imgYellow,
  confused: imgWhite,
  crying: imgBlue,
};

function addMonths(date, delta) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + delta);
  return d;
}
function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}
function ymd(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function Calendar() {
  const [viewDate, setViewDate] = useState(() => startOfMonth(new Date()));
  const [isOpen, setIsOpen] = useState(false);

  const [entries, setEntries] = useState({});
  useEffect(() => {
    try {
      const raw = localStorage.getItem("diaryEntries");
      if (raw) setEntries(JSON.parse(raw));
    } catch {}
  }, []);
  const saveEntries = (next) => {
    setEntries(next);
    try {
      localStorage.setItem("diaryEntries", JSON.stringify(next));
    } catch {}
  };

  const [isEmotionOpen, setIsEmotionOpen] = useState(false);
  const [isDiaryOpen, setIsDiaryOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [pickedEmotion, setPickedEmotion] = useState("");

  const openModalFor = (dateObj) => {
    setSelectedDate(dateObj);
    setIsEmotionOpen(true);
  };

  const handlePickEmotion = (emotionId) => {
    setPickedEmotion(emotionId);
    setIsEmotionOpen(false);
    setIsDiaryOpen(true);
  };

  const handleSaveDiary = (text) => {
    if (!selectedDate) return;
    const k = ymd(selectedDate);
    const next = {
      ...entries,
      [k]: { emotion: pickedEmotion, text, updatedAt: Date.now() },
    };
    saveEntries(next);
    setIsDiaryOpen(false);
  };

  const grid = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const first = new Date(year, month, 1);
    const firstWeekday = first.getDay();
    const thisMonthDays = daysInMonth(year, month);

    const needed = firstWeekday + thisMonthDays;
    const totalCells = needed <= 35 ? 35 : 42;

    const lastDayOfPrev = new Date(year, month, 0).getDate();
    const prevStart = lastDayOfPrev - firstWeekday + 1;

    const cells = [];
    for (let i = 0; i < firstWeekday; i++) {
      const day = prevStart + i;
      cells.push({
        key: `p-${day}`,
        date: new Date(year, month - 1, day),
        inCurrentMonth: false,
      });
    }
    for (let d = 1; d <= thisMonthDays; d++) {
      cells.push({
        key: `c-${d}`,
        date: new Date(year, month, d),
        inCurrentMonth: true,
      });
    }
    let nextDay = 1;
    while (cells.length < totalCells) {
      cells.push({
        key: `n-${nextDay}`,
        date: new Date(year, month + 1, nextDay++),
        inCurrentMonth: false,
      });
    }
    return cells;
  }, [viewDate]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  return (
    <div className="relative min-h-screen text-white">
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${wallpaper})` }}
      />

      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} showAuthLinks={false} />

      <div className="w-[90%] max-w-5xl mx-auto mt-16 mb-5 flex flex-col items-center gap-6">
        <h1 className="text-4xl tracking-wide">STAR CALENDAR</h1>
        <div className="flex items-center gap-8 text-2xl">
          <button
            className="px-2 py-1 hover:opacity-80 text-3xl cursor-pointer"
            onClick={() => setViewDate((d) => addMonths(d, -1))}
          >
            {"<"}
          </button>
          <span className="min-w-[12rem] text-center text-2xl flex justify-center gap-6">
            <span>{year}</span>
            <span>{MONTH_NAMES[month].toUpperCase()}</span>
          </span>
          <button
            className="px-2 py-1 hover:opacity-80 text-3xl cursor-pointer"
            onClick={() => setViewDate((d) => addMonths(d, 1))}
          >
            {">"}
          </button>
        </div>
      </div>

      <div className="w-[90%] max-w-5xl mx-auto grid grid-cols-7 text-center mb-1">
        {WEEKDAY_NAMES.map((day) => (
          <div key={day} className="py-2 text-sm sm:text-base">
            {day}
          </div>
        ))}
      </div>

      <div className="w-[90%] max-w-5xl mx-auto rounded-xl border border-white overflow-hidden">
        <div className="grid grid-cols-7">
          {grid.map((cell, idx) => {
            const label = cell.date.getDate();
            const isCurrent = cell.inCurrentMonth;
            const k = ymd(cell.date);
            const emotionId = entries[k]?.emotion;

            const isLastCol = (idx + 1) % 7 === 0;
            const isLastRow = idx >= grid.length - 7;

            return (
              <div
                key={cell.key}
                role="button"
                tabIndex={0}
                onClick={() => openModalFor(cell.date)}
                onKeyDown={(e) =>
                  (e.key === "Enter" || e.key === " ") &&
                  openModalFor(cell.date)
                }
                className={`h-24 sm:h-28 md:h-32 relative bg-black/30 cursor-pointer
                  ${isLastCol ? "" : "border-r border-white"}
                  ${isLastRow ? "" : "border-b border-white"}`}
              >
                <div
                  className={`absolute top-2 left-2 text-sm ${
                    isCurrent ? "opacity-100" : "opacity-40"
                  }`}
                >
                  {label}
                </div>

                {/* 달력 내 별 아이콘 */}
                {emotionId && CAL_IMAGE[emotionId] && (
                  <img
                    src={CAL_IMAGE[emotionId]}
                    alt=""
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
               w-8 h-8 md:w-10 md:h-10 object-contain pointer-events-none drop-shadow"
                    draggable={false}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="w-[90%] max-w-5xl mx-auto flex justify-start mt-4">
        <Link to="/" className="text-sm">
          {"<"} Back
        </Link>
      </div>

      <EmotionModal
        open={isEmotionOpen}
        date={selectedDate}
        onClose={() => setIsEmotionOpen(false)}
        onPick={handlePickEmotion}
      />
      <DiaryModal
        open={isDiaryOpen}
        dateStr={selectedDate ? ymd(selectedDate) : ""}
        emotionId={pickedEmotion}
        initialText={selectedDate ? entries[ymd(selectedDate)]?.text || "" : ""}
        onClose={() => setIsDiaryOpen(false)}
        onSave={handleSaveDiary}
      />
    </div>
  );
}
