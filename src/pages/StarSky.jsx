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

import getNightSkyStar from "../apis/Star/getNightSkyStar";
import repositionStar from "../apis/Star/repositionStar";

import getConstellation from "../apis/Constellation/getConstellation";
import createConstellation from "../apis/Constellation/createConstellation";
import repositionConstellation from "../apis/Constellation/repositionConstellation";

import imgYellow from "../assets/emotions/yellow.png";
import imgBlue from "../assets/emotions/blue.png";
import imgOrange from "../assets/emotions/orange.png";
import imgRed from "../assets/emotions/red.png";
import imgGreen from "../assets/emotions/green.png";
import imgPurple from "../assets/emotions/purple.png";

const COLOR_IMAGE = {
  YELLOW: imgYellow,
  BLUE: imgBlue,
  ORANGE: imgOrange,
  RED: imgRed,
  GREEN: imgGreen,
  PURPLE: imgPurple,
};

const monthsForPair = (pair) => [pair * 2 + 1, pair * 2 + 2];
const rand01 = () => Math.random();
const clamp01 = (v) => Math.max(0, Math.min(1, v));

const MIN_PICK = 7;
const MAX_PICK = 14;
const LOCAL_CONST_NAME_KEY = "starsky.constellationNameCache.v1";
const makeStarIdsKey = (ids = []) =>
  ids
    .map((x) => String(x))
    .sort()
    .join(",");

const loadNameCache = () => {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(LOCAL_CONST_NAME_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed === "object" && parsed) return parsed;
    return {};
  } catch {
    return {};
  }
};

const saveNameCache = (obj) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_CONST_NAME_KEY, JSON.stringify(obj));
  } catch (e) {
    console.warn("별자리 이름 캐시 저장 실패:", e);
  }
};

const StarSky = () => {
  const navigate = useNavigate();

  const now = new Date();
  const [{ year, pair }, setCal] = useState({
    year: now.getFullYear(),
    pair: Math.floor(now.getMonth() / 2),
  });

  const [isOpen, setIsOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [rawStars, setRawStars] = useState([]);
  const coordsCacheRef = useRef(new Map());
  const [stars, setStars] = useState([]);

  const [constellation, setConstellation] = useState({
    name: "",
    desc: "",
    createdAt: "",
  });
  const [constellationEdges, setConstellationEdges] = useState([]);
  const [serverConstellations, setServerConstellations] = useState([]);
  const [locked, setLocked] = useState(false);
  const [selectedStarIds, setSelectedStarIds] = useState([]);
  const [m1, m2] = useMemo(() => monthsForPair(pair), [pair]);
  const nameCacheRef = useRef(loadNameCache());

  const normalizeStars = (list = []) =>
    list
      .map((it) => ({
        id: it.starId ?? it.id ?? it.date,
        color: String(it.color || "").toUpperCase(),
        date: it.date,
        x: typeof it.x === "number" ? clamp01(it.x) : null,
        y: typeof it.y === "number" ? clamp01(it.y) : null,
      }))
      .filter((s) => s.id && s.color && s.date);

  const normalizeConstellations = (rawList = []) => {
    if (!Array.isArray(rawList)) return [];

    return rawList.map((c) => {
      const rawStars =
        c.stars || c.starts || c.starList || c.star || c.starEntities || [];

      const rawConnections =
        c.connections || c.connectionList || c.edges || c.lines || [];

      const serverStarIds = rawStars
        .map((s) => s.starId ?? s.id)
        .filter(Boolean);

      const starKey = makeStarIdsKey(serverStarIds);
      const cached = nameCacheRef.current[starKey];

      const finalName =
        c.name && c.name.trim() !== "" ? c.name : cached?.name || "";
      const finalDesc =
        c.description && c.description.trim() !== ""
          ? c.description
          : cached?.desc || "";

      const baseDate =
        cached?.createdAt ||
        c.createdAt ||
        c.createdDate ||
        c.date ||
        (rawStars[0]?.date ?? new Date().toISOString().slice(0, 10));

      return {
        id: c.constellationId ?? c.id,
        constellationId: c.constellationId ?? c.id,
        name: finalName,
        description: finalDesc,
        createdAt: baseDate,
        constellationCreatedAt: baseDate,
        x: typeof c.x === "number" ? clamp01(c.x) : 0.5,
        y: typeof c.y === "number" ? clamp01(c.y) : 0.5,
        stars: rawStars.map((s) => ({
          id: s.starId ?? s.id,
          starId: s.starId ?? s.id,
          color: String(s.color || "").toUpperCase(),
          x: typeof s.x === "number" ? clamp01(s.x) : 0.5,
          y: typeof s.y === "number" ? clamp01(s.y) : 0.5,
          date: s.date || baseDate,
        })),
        connections: rawConnections.map((conn) => {
          const a =
            conn.startStarId ??
            conn.fromId ??
            conn.sourceStarId ??
            conn.a ??
            conn[0];
          const b =
            conn.endStarId ??
            conn.toId ??
            conn.targetStarId ??
            conn.b ??
            conn[1];
          return { startStarId: String(a), endStarId: String(b) };
        }),
      };
    });
  };

  const fetchNight = useCallback(async () => {
    setLoading(true);
    try {
      const queryMonth = pair * 2 + 1;
      const list = await getNightSkyStar(year, queryMonth);
      setRawStars(normalizeStars(list));
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

  const fetchConstellations = useCallback(async () => {
    const month = pair * 2 + 1;
    try {
      const raw = await getConstellation(year, month);
      let normalized = normalizeConstellations(raw);

      if (!normalized.length) {
        const alt = [];
        const prevMonth = month - 1;
        if (prevMonth >= 1) {
          try {
            const rawPrev = await getConstellation(year, prevMonth);
            alt.push(...normalizeConstellations(rawPrev));
          } catch (e) {
            console.warn("이전 달 별자리 불러오기 실패:", e.message);
          }
        }
        const nextMonth = month + 1;
        if (nextMonth <= 12) {
          try {
            const rawNext = await getConstellation(year, nextMonth);
            alt.push(...normalizeConstellations(rawNext));
          } catch (e) {
            console.warn("다음 달 별자리 불러오기 실패:", e.message);
          }
        }
        if (alt.length) {
          console.log(
            "[StarSky] 기본 month로는 별자리가 안 와서 앞/뒤 달로 대체함",
            { month, alt }
          );
          normalized = alt;
        }
      }

      setServerConstellations(normalized);
      if (normalized.length > 0) setLocked(true);
    } catch (e) {
      console.error(
        "백엔드 별자리 불러오기 실패:",
        e.response?.data || e.message
      );
      setServerConstellations([]);
    }
  }, [year, pair]);

  useEffect(() => {
    fetchNight();
    fetchConstellations();
  }, [fetchNight, fetchConstellations]);

  useEffect(() => {
    const onUpdated = () => {
      fetchNight();
      fetchConstellations();
    };
    window.addEventListener("stars-updated", onUpdated);
    return () => window.removeEventListener("stars-updated", onUpdated);
  }, [fetchNight, fetchConstellations]);

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

  const handleConstellationMove = async (constellationId, movedStarsMap) => {
    setServerConstellations((prev) =>
      prev.map((c) => {
        if (c.constellationId !== constellationId && c.id !== constellationId)
          return c;
        return {
          ...c,
          stars: (c.stars || []).map((st) => {
            const key = st.starId ?? st.id;
            const np = movedStarsMap[key];
            if (!np) return st;
            return { ...st, x: np.x, y: np.y };
          }),
        };
      })
    );

    try {
      const firstKey = Object.keys(movedStarsMap)[0];
      if (firstKey) {
        const p = movedStarsMap[firstKey];
        await repositionConstellation(constellationId, {
          x: p.x,
          y: p.y,
        });
      }
      const tasks = [];
      for (const [id, pos] of Object.entries(movedStarsMap)) {
        tasks.push(repositionStar(id, { x: pos.x, y: pos.y }));
      }
      if (tasks.length) await Promise.all(tasks);
    } catch (e) {
      console.error("별자리 이동 저장 실패:", e);
    }
  };

  const handlePrev = () =>
    setCal(({ year, pair }) =>
      pair === 0 ? { year: year - 1, pair: 5 } : { year, pair: pair - 1 }
    );
  const handleNext = () =>
    setCal(({ year, pair }) =>
      pair === 5 ? { year: year + 1, pair: 0 } : { year, pair: pair + 1 }
    );

  const handleGenerate = () => {
    const cnt = selectedStarIds.length;
    if (cnt < MIN_PICK || cnt > MAX_PICK) {
      alert(`별을 ${MIN_PICK}~${MAX_PICK}개 선택해주세요. (현재 ${cnt}개)`);
      return;
    }
    setOpen(true);
  };

  const handleSubmit = async ({
    name,
    desc,
    lines = [],
    starPositions = {},
  }) => {
    const trimmedName = name?.trim() || "";
    const trimmedDesc = desc?.trim() || "";
    const createdAtStr = new Date().toISOString().slice(0, 10);

    setConstellation({
      name: trimmedName,
      desc: trimmedDesc,
      createdAt: createdAtStr,
    });
    setConstellationEdges(lines);

    const starIdsFromModal = Object.keys(starPositions || {});
    if (starIdsFromModal.length > 0) {
      const key = makeStarIdsKey(starIdsFromModal);
      nameCacheRef.current = {
        ...nameCacheRef.current,
        [key]: {
          name: trimmedName || "미지정 별자리",
          desc: trimmedDesc || "",
          createdAt: createdAtStr,
        },
      };
      saveNameCache(nameCacheRef.current);
    }

    if (starPositions && Object.keys(starPositions).length > 0) {
      const cache = coordsCacheRef.current;
      setStars((prev) =>
        prev.map((s) => {
          const p = starPositions[s.id];
          if (!p) return s;
          const nx = clamp01(p.x);
          const ny = clamp01(p.y);
          cache.set(s.id, { x: nx, y: ny });
          return { ...s, x: nx, y: ny };
        })
      );
    }

    try {
      const starsPayload = Object.entries(starPositions).map(([id, pos]) => {
        const original = stars.find((s) => String(s.id) === String(id));
        return {
          starId: Number(id),
          x: pos.x,
          y: pos.y,
          date: original?.date || new Date().toISOString().slice(0, 10),
          color: original?.color || "YELLOW",
        };
      });

      await createConstellation({
        name: trimmedName,
        description: trimmedDesc,
        stars: starsPayload,
        connections: (lines || []).map(([a, b]) => ({
          startStarId: Number(a),
          endStarId: Number(b),
        })),
      });

      await fetchConstellations();
      setLocked(true);
    } catch (e) {
      console.error("별자리 생성/수정 실패:", e);
    }

    setSelectedStarIds([]);
    setOpen(false);
  };

  const filteredConstellations = useMemo(() => {
    if (!serverConstellations.length) return [];
    return serverConstellations.filter((c) => {
      const hasStarInThisPair = (c.stars || []).some((st) => {
        if (!st.date) return false;
        const m = new Date(st.date).getMonth() + 1;
        return m === m1 || m === m2;
      });

      if (hasStarInThisPair) return true;

      if (c.createdAt) {
        const m = new Date(c.createdAt).getMonth() + 1;
        if (m === m1 || m === m2) return true;
      }

      return false;
    });
  }, [serverConstellations, m1, m2]);

  const useMultipleMode = filteredConstellations.length > 0;

  return (
    <div className="min-h-screen relative text-white">
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

      <div className="h-[70vh] flex items-center justify-center pointer-events-none">
        {loading && <p className="text-white/60">Loading stars…</p>}
      </div>

      <StarSkyDate
        year={year}
        monthPairIndex={pair}
        onPrev={handlePrev}
        onNext={handleNext}
        stars={stars}
        colorImageMap={COLOR_IMAGE}
        constellationGroups={useMultipleMode ? filteredConstellations : null}
        onMove={handleMove}
        onConstellationMove={
          useMultipleMode ? handleConstellationMove : undefined
        }
        edges={useMultipleMode ? [] : constellationEdges}
        locked={locked}
        initialScaleOnLock={0.5}
        constellationMeta={
          useMultipleMode
            ? { name: "", createdAt: "" }
            : {
                name: constellation.name,
                createdAt: constellation.createdAt,
              }
        }
        onTransformEnd={
          useMultipleMode
            ? undefined
            : async (map) => {
                try {
                  const tasks = [];
                  for (const [id, pos] of Object.entries(map)) {
                    tasks.push(repositionStar(id, { x: pos.x, y: pos.y }));
                  }
                  if (tasks.length) await Promise.all(tasks);
                } catch (e) {
                  console.error("별자리 이동/스케일 저장 실패:", e);
                }
              }
        }
        selectedIds={selectedStarIds}
        onSelectChange={setSelectedStarIds}
      />

      <ConstellationModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        initial={constellation}
        colorImageMap={COLOR_IMAGE}
        stars={
          selectedStarIds.length > 0
            ? stars.filter((s) => selectedStarIds.includes(s.id))
            : stars
        }
      />
    </div>
  );
};

export default StarSky;
