// src/pages/StarSky.jsx
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { CiMenuBurger } from "react-icons/ci";
import StarSkyDate from "../components/StarSkyDate";
import ConstellationModal from "../components/ConstellationModal";

import getNightSkyStar from "../apis/Star/getNightSkyStar"; // GET /api/v1/star?year&month
import repositionStar from "../apis/Star/repositionStar"; // PATCH /api/v1/star/reposition/{id}

import imgBlue from "../assets/emotions/blue.png";
import imgOrange from "../assets/emotions/orange.png";
import imgRed from "../assets/emotions/red.png";
import imgSkyblue from "../assets/emotions/skyblue.png";
import imgWhite from "../assets/emotions/white.png";
import imgYellow from "../assets/emotions/yellow.png";

const COLOR_IMAGE = {
  YELLOW: imgYellow,
  BLUE: imgBlue,
  ORANGE: imgOrange,
  RED: imgRed,
  SKYBLUE: imgSkyblue,
  WHITE: imgWhite,
};

const monthsForPair = (pair) => [pair * 2 + 1, pair * 2 + 2];
const rand01 = () => Math.random();
const clamp01 = (v) => Math.max(0, Math.min(1, v));

const MIN_PICK = 7;
const MAX_PICK = 14;

const StarSky = () => {
  const navigate = useNavigate();

  // 오늘 기준 초기 페어
  const now = new Date();
  const [{ year, pair }, setCal] = useState({
    year: now.getFullYear(),
    pair: Math.floor(now.getMonth() / 2),
  });

  const [isOpen, setIsOpen] = useState(false); // 사이드바
  const [open, setOpen] = useState(false); // 모달(Generate)

  const [loading, setLoading] = useState(false);
  const [rawStars, setRawStars] = useState([]); // [{id,color,date,x?,y?}]
  const coordsCacheRef = useRef(new Map()); // id -> {x,y}
  const [stars, setStars] = useState([]); // [{id,color,x,y}]

  // 별자리 메타 + 선
  const [constellation, setConstellation] = useState({
    name: "",
    desc: "",
    createdAt: "", // yyyy-mm-dd
  });
  const [constellationEdges, setConstellationEdges] = useState([]); // [[idA,idB], ...]

  // 별자리 생성 이후에는 고정
  const [locked, setLocked] = useState(false);

  // ⭐ 밤하늘에서 선택한 별들 (locked=false에서만 의미)
  const [selectedStarIds, setSelectedStarIds] = useState([]);

  const [m1, m2] = useMemo(() => monthsForPair(pair), [pair]);

  // 서버 응답 표준화
  const normalize = (list = []) =>
    list
      .map((it) => ({
        id: it.starId ?? it.id ?? it.date,
        color: String(it.color || "").toUpperCase(),
        date: it.date,
        x: typeof it.x === "number" ? clamp01(it.x) : null,
        y: typeof it.y === "number" ? clamp01(it.y) : null,
      }))
      .filter((s) => s.id && s.color && s.date);

  // 별 목록 불러오기 (두 달 페어)
  const fetchNight = useCallback(async () => {
    setLoading(true);
    try {
      const queryMonth = pair * 2 + 1; // 9 -> 9~10월
      const list = await getNightSkyStar(year, queryMonth);
      setRawStars(normalize(list));
    } catch (e) {
      const status = e?.response?.status || e?.status;
      if (status === 401) {
        navigate("/signin");
        return;
      }
      console.error("별 불러오기 실패:", e);
      setRawStars([]);
    } finally {
      setLoading(false);
    }
  }, [year, pair, navigate]);

  useEffect(() => {
    fetchNight();
  }, [fetchNight]);

  // 캘린더에서 생성 완료 브로드캐스트 받으면 갱신
  useEffect(() => {
    const onUpdated = () => fetchNight();
    window.addEventListener("stars-updated", onUpdated);
    return () => window.removeEventListener("stars-updated", onUpdated);
  }, [fetchNight]);

  // 렌더 좌표 생성(서버 > 캐시 > 랜덤)
  useEffect(() => {
    const cache = coordsCacheRef.current;
    const next = rawStars.map((s) => {
      const cached = cache.get(s.id);
      const x = s.x ?? cached?.x ?? rand01();
      const y = s.y ?? cached?.y ?? rand01();
      cache.set(s.id, { x, y });
      return { id: s.id, color: s.color, x, y, date: s.date };
    });
    setStars(next);
  }, [rawStars]);

  // 별 이동(PATCH Optimistic + 실패 롤백) — locked이면 호출하지 않음
  const handleMove = async (id, x, y) => {
    const nx = clamp01(x);
    const ny = clamp01(y);
    const prev = coordsCacheRef.current.get(id);

    coordsCacheRef.current.set(id, { x: nx, y: ny });
    setStars((arr) =>
      arr.map((s) => (s.id === id ? { ...s, x: nx, y: ny } : s))
    );

    try {
      await repositionStar(id, { x: nx, y: ny });
    } catch (e) {
      if (prev) coordsCacheRef.current.set(id, prev);
      setStars((arr) => arr.map((s) => (s.id === id ? { ...s, ...prev } : s)));
      console.error("별 위치 저장 실패", e);
    }
  };

  // 월 네비게이션
  const handlePrev = () =>
    setCal(({ year, pair }) =>
      pair === 0 ? { year: year - 1, pair: 5 } : { year, pair: pair - 1 }
    );
  const handleNext = () =>
    setCal(({ year, pair }) =>
      pair === 5 ? { year: year + 1, pair: 0 } : { year, pair: pair + 1 }
    );

  // Generate → 모달 열기 (locked=false: 선택 7~14개 검증)
  const handleGenerate = () => {
    if (!locked) {
      const cnt = selectedStarIds.length;
      if (cnt < MIN_PICK || cnt > MAX_PICK) {
        alert(`별을 ${MIN_PICK}~${MAX_PICK}개 선택해주세요. (현재 ${cnt}개)`);
        return;
      }
    }
    setOpen(true);
  };

  // yyyy-mm-dd 포맷터
  const pad2 = (n) => String(n).padStart(2, "0");
  const ymd = (d) =>
    `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

  // 모달 제출: 선 + 좌표 반영, 서버 저장(변경분만), 고정
  const handleSubmit = async ({
    name,
    desc,
    lines = [],
    starPositions = {},
  }) => {
    setConstellation({
      name: name?.trim() || "",
      desc: desc?.trim() || "",
      createdAt: ymd(new Date()), // 생성 날짜 저장
    });
    setConstellationEdges(lines);

    // 프론트 상태/캐시에 즉시 반영
    if (starPositions && Object.keys(starPositions).length > 0) {
      const cache = coordsCacheRef.current;
      const next = stars.map((s) => {
        const p = starPositions[s.id];
        if (!p) return s;
        const nx = clamp01(p.x);
        const ny = clamp01(p.y);
        cache.set(s.id, { x: nx, y: ny });
        return { ...s, x: nx, y: ny };
      });
      setStars(next);

      // 백엔드에도 저장 (diff 후 변경된 별만 PATCH)
      try {
        const tasks = [];
        for (const [id, pos] of Object.entries(starPositions)) {
          const nx = clamp01(pos.x);
          const ny = clamp01(pos.y);
          const prev = rawStars.find(
            (r) => (r.starId ?? r.id ?? r.date) === id
          );
          const prevX = typeof prev?.x === "number" ? clamp01(prev.x) : null;
          const prevY = typeof prev?.y === "number" ? clamp01(prev.y) : null;
          if (prevX !== nx || prevY !== ny) {
            tasks.push(repositionStar(id, { x: nx, y: ny }));
          }
        }
        if (tasks.length) await Promise.all(tasks);
      } catch (e) {
        console.error("모달에서 설정한 좌표 저장 실패:", e);
      }
    }

    // 생성 후: 선택 초기화 + 잠금 모드 진입
    setSelectedStarIds([]);
    setLocked(true);
    setOpen(false);
  };

  return (
    <div className="min-h-screen relative text-white">
      {/* NAV / SIDEBAR */}
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          aria-hidden="true"
          onClick={() => setIsOpen(false)}
        />
      )}

      <button
        className="absolute z-[70] ml-[1.81rem] mt-[2.13rem]"
        onClick={() => setIsOpen(true)}
        aria-label="open sidebar"
      >
        <CiMenuBurger size={30} />
      </button>

      <button
        onClick={handleGenerate}
        className="absolute top-3 right-3 z-[70] px-4 py-2 text-white text-[20px]"
      >
        Generate
      </button>

      {/* 상태 표시: 로딩만 유지 */}
      <div className="h-[70vh] flex items-center justify-center pointer-events-none">
        <div className="text-center">
          {loading && <p className="mt-2 text-white/60">Loading stars…</p>}
        </div>
      </div>

      {/* 밤하늘 (locked이면 onMove 비활성) */}
      <StarSkyDate
        year={year}
        monthPairIndex={pair}
        onPrev={handlePrev}
        onNext={handleNext}
        stars={stars}
        colorImageMap={COLOR_IMAGE}
        onMove={locked ? undefined : handleMove}
        edges={constellationEdges}
        locked={locked}
        initialScaleOnLock={0.5}
        // 툴팁용 별자리 메타 전달
        constellationMeta={{
          name: constellation.name,
          createdAt: constellation.createdAt, // yyyy-mm-dd
        }}
        onTransformEnd={async (map) => {
          // 박스 이동/스케일 확정 시 백엔드 저장
          try {
            const tasks = [];
            for (const [id, pos] of Object.entries(map)) {
              tasks.push(repositionStar(id, { x: pos.x, y: pos.y }));
            }
            if (tasks.length) await Promise.all(tasks);
          } catch (e) {
            console.error("별자리 이동/스케일 저장 실패:", e);
          }
        }}
        // ⭐ 선택 상태 연결 (locked=false 일 때만 사용)
        selectedIds={selectedStarIds}
        onSelectChange={setSelectedStarIds}
      />

      {/* 별자리 생성 모달: locked=false일 때 선택된 별만 전달 */}
      <ConstellationModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        initial={constellation}
        colorImageMap={COLOR_IMAGE}
        stars={
          locked
            ? stars // 잠금 모드면 전체 전달(이미 생성됨)
            : stars.filter((s) => selectedStarIds.includes(s.id))
        }
      />
    </div>
  );
};

export default StarSky;
