import React, { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CiMenuBurger } from "react-icons/ci";
import Sidebar from "../components/Sidebar";
import EmotionModal from "../components/Calendar/EmotionModal";
import DiaryModal from "../components/Calendar/DiaryModal";
import { getAccessToken } from "../apis/api";
import getStars from "../apis/Calendar/getStars";
import getDiary from "../apis/Calendar/getDiary";
import createDiary from "../apis/Calendar/createDiary";
import editDiary from "../apis/Calendar/editDiary";
import imgBlue from "../assets/emotions/blue.png";
import imgOrange from "../assets/emotions/orange.png";
import imgRed from "../assets/emotions/red.png";
import imgGreen from "../assets/emotions/green.png";
import imgPurple from "../assets/emotions/purple.png";
import imgYellow from "../assets/emotions/yellow.png";

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const WEEKDAY_NAMES = [
  "Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday",
];

const COLOR_IMAGE = {
  YELLOW: imgYellow,
  BLUE: imgBlue,
  ORANGE: imgOrange,
  RED: imgRed,
  PURPLE: imgPurple,
  GREEN: imgGreen,
};

const EMOTION_LOCAL_TO_API = {
  funny: "FUNNY",
  angry: "ANGER",
  wow: "SURPRISING",
  happy: "HAPPINESS",
  neutral: "NEUTRAL",
  crying: "SADNESS",
};
const EMOTION_API_TO_LOCAL = {
  HAPPINESS: "happy",
  ANGER: "angry",
  SADNESS: "crying",
  SURPRISING: "wow",
  NEUTRAL: "neutral",
  FUNNY: "funny",
};
const TAG_TO_FACTOR = {
  일: "WORK",
  공부: "EDUCATION",
  친구: "FRIEND",
  여행: "TRIP",
  취미: "HOBBY",
  연인: "LOVER",
  가족: "FAMILY",
  건강: "HEALTH",
  기타: "ETC",
};

function addMonths(date, delta) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + delta);
  return d;
}
function daysInMonth(y, mIdx) {
  return new Date(y, mIdx + 1, 0).getDate();
}
function ymd(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function parseISODate(iso) {
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00`);
  return isNaN(d.getTime()) ? null : d;
}

function Calendar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [viewDate, setViewDate] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [isOpen, setIsOpen] = useState(false);

  const [stars, setStars] = useState({});
  const [entries, setEntries] = useState({});
  const [msg, setMsg] = useState("");

  const [isEmotionOpen, setIsEmotionOpen] = useState(false);
  const [isDiaryOpen, setIsDiaryOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [pickedEmotion, setPickedEmotion] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);

  const didOpenFromQueryRef = useRef(false);

  const userName =
    localStorage.getItem("nickname") ||
    sessionStorage.getItem("nickname") ||
    "";

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

  useEffect(() => {
    const t = getAccessToken();
    if (!t) {
      navigate("/signin");
      return;
    }

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    (async () => {
      try {
        const list = await getStars(year, month + 1);
        const map = {};
        for (const it of list) map[it.date] = it.color;
        setStars(map);
      } catch (e) {
        const status = e?.response?.status || e?.status;
        if (status === 401 || e?.message?.includes("토큰")) {
          navigate("/signin");
          return;
        }
        setStars({});
      }
    })();
  }, [viewDate, navigate]);

  const openModalFor = async (dateObj) => {
    setSelectedDate(dateObj);
    const k = ymd(dateObj);

    try {
      const data = await getDiary(k);

      if (!data) {
        setPickedEmotion("");
        setSelectedTags([]);
        setIsEdit(false);
        setIsEmotionOpen(true);
        return;
      }

      const localEmotion = EMOTION_API_TO_LOCAL[data.emotion] || "";
      setPickedEmotion(localEmotion);
      setSelectedTags(
        data.factors?.map((f) =>
          Object.keys(TAG_TO_FACTOR).find((kk) => TAG_TO_FACTOR[kk] === f)
        ) || []
      );
      setEntries((prev) => ({
        ...prev,
        [k]: { text: data.content, emotion: localEmotion, color: data.color },
      }));
      setIsEdit(true);
      setIsDiaryOpen(true);
    } catch (e) {
      const status = e?.response?.status || e?.status;
      if (status === 401 || e?.message?.includes("토큰")) {
        navigate("/signin");
        return;
      }
    }
  };

  const handlePickEmotion = (emotionId, tags = []) => {
    setPickedEmotion(emotionId);
    setSelectedTags(tags);
    setIsEmotionOpen(false);
    setIsEdit(false);
    setIsDiaryOpen(true);
  };

  const refreshStars = async () => {
    const y = viewDate.getFullYear();
    const m = viewDate.getMonth() + 1;
    try {
      const list = await getStars(y, m);
      const map = {};
      for (const it of list) map[it.date] = it.color;
      setStars(map);
    } catch {}
  };

  const handleSaveDiary = async (text) => {
    if (!selectedDate) return;
    const k = ymd(selectedDate);

    if (!isEdit) {
      try {
        const factors = selectedTags
          .map((t) => TAG_TO_FACTOR[t])
          .filter(Boolean);

        const payload = {
          emotion: EMOTION_LOCAL_TO_API[pickedEmotion] || pickedEmotion,
          factors,
          content: text,
          date: k,
        };

        const data = await createDiary(payload);

        setEntries((prev) => ({
          ...prev,
          [k]: {
            text: data.content,
            emotion: pickedEmotion,
            color: data.color,
          },
        }));
        setStars((prev) => ({ ...prev, [k]: data.color }));
        await refreshStars();
        window.dispatchEvent(new Event("stars-updated"));
      } catch (e) {
        const status = e?.response?.status || e?.status;
        if (status === 401 || e?.message?.includes("토큰")) {
          navigate("/signin");
          return;
        }
        throw e;
      }
    } else {
      try {
        await editDiary({ date: k, content: text });
        setEntries((prev) => ({
          ...prev,
          [k]: { ...(prev[k] || {}), text },
        }));
        await refreshStars();
        window.dispatchEvent(new Event("stars-updated"));
      } catch (e) {
        const status = e?.response?.status || e?.status;
        if (status === 401 || e?.message?.includes("토큰")) {
          navigate("/signin");
          return;
        }
        throw e;
      }
    }
  };


  useEffect(() => {
    const search = new URLSearchParams(location.search);
    const qDate = search.get("date"); // yyyy-mm-dd
    if (!qDate || didOpenFromQueryRef.current) return;

    const d = parseISODate(qDate);
    if (!d) return;

 
    setViewDate(new Date(d.getFullYear(), d.getMonth(), 1));

    setTimeout(() => {
      didOpenFromQueryRef.current = true;
      openModalFor(d);
    }, 0);
  }, [location.search]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  return (
    <div className="min-h-screen text-white">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          aria-hidden="true"
          onClick={() => setIsOpen(false)}
        />
      )}
      <button
        className="ml-[1.81rem] mt-[2.13rem]"
        onClick={() => setIsOpen(true)}
        aria-label="open sidebar"
      >
        <CiMenuBurger className="cursor-pointer" size={30} />
      </button>

      <div className="w-[90%] max-w-5xl mx-auto mt-10 mb-5 flex flex-col items-center gap-6">
        <span className="text-[50px] font-julius">STAR CALENDAR</span>
        <span className="text-[30px] font-julius flex items-center gap-8">
          <button
            onClick={() => setViewDate((d) => addMonths(d, -1))}
            className="cursor-pointer"
          >
            {"<"}
          </button>
          <span className="min-w-48 text-[30px] text-center flex justify-center gap-6">
            <span>{year}</span>
            <span>{MONTH_NAMES[month].toUpperCase()}</span>
          </span>
          <button
            onClick={() => setViewDate((d) => addMonths(d, 1))}
            className="cursor-pointer"
          >
            {">"}
          </button>
        </span>
      </div>

      <div className="w-[90%] max-w-5xl mx-auto grid grid-cols-7 text-center mb-1">
        {WEEKDAY_NAMES.map((day) => (
          <span key={day} className="py-2 text-sm sm:text-base">
            {day}
          </span>
        ))}
      </div>

      <div className="w-[90%] max-w-5xl mx-auto rounded-[10px] border border-white overflow-hidden">
        <div className="grid grid-cols-7">
          {grid.map((cell, idx) => {
            const label = cell.date.getDate();
            const k = ymd(cell.date);
            const color = stars[k];
            const isLastCol = (idx + 1) % 7 === 0;
            const isLastRow = idx >= grid.length - 7;
            return (
              <div
                key={cell.key}
                onClick={() => openModalFor(cell.date)}
                className={`h-24 sm:h-28 md:h-32 relative bg-black/30 cursor-pointer ${
                  isLastCol ? "" : "border-r border-white"
                } ${isLastRow ? "" : "border-b border-white"}`}
              >
                <div
                  className={`absolute top-2 left-2 text-sm ${
                    cell.inCurrentMonth ? "" : "opacity-40"
                  }`}
                >
                  {label}
                </div>
                {color && COLOR_IMAGE[color] && (
                  <img
                    src={COLOR_IMAGE[color]}
                    alt=""
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                                w-8 h-8 md:w-10 md:h-10 ${
                                  cell.inCurrentMonth ? "" : "opacity-40"
                                }`}
                    draggable={false}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="w-[90%] max-w-5xl mx-auto flex justify-start mt-4 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="text-[20px] hover:underline hover:underline-offset-4 cursor-pointer ml-[0.6rem]"
        >
          {"<"} Back
        </button>
      </div>

      <EmotionModal
        open={isEmotionOpen}
        initialEmotion={pickedEmotion}
        initialTags={selectedTags}
        selectedDate={selectedDate}
        onClose={() => setIsEmotionOpen(false)}
        onPick={handlePickEmotion}
      />

      <DiaryModal
        open={isDiaryOpen}
        dateStr={selectedDate ? ymd(selectedDate) : ""}
        emotionId={pickedEmotion}
        initialText={selectedDate ? entries[ymd(selectedDate)]?.text || "" : ""}
        isEdit={isEdit}
        onClose={() => setIsDiaryOpen(false)}
        onSave={handleSaveDiary}
        userName={userName}
        tags={selectedTags}
        onBack={() => {
          setIsDiaryOpen(false);
          setIsEmotionOpen(true);
        }}
      />

      {msg && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded">
          {msg}
        </div>
      )}
    </div>
  );
}

export default Calendar;
