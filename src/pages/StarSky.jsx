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

import imgBlue from "../assets/emotions/blue.png";
import imgOrange from "../assets/emotions/orange.png";
import imgRed from "../assets/emotions/red.png";
import imgSkyblue from "../assets/emotions/purple.png";
import imgWhite from "../assets/emotions/green.png";
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

  const [constellations, setConstellations] = useState([]);
  const [selectedStarIds, setSelectedStarIds] = useState([]);
  const [locked, setLocked] = useState(false);

  const [m1, m2] = useMemo(() => monthsForPair(pair), [pair]);

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
      const cDate =
        c.createdAt ||
        c.createdDate ||
        c.date ||
        new Date().toISOString().slice(0, 10);

      const rawStars = c.stars || c.starts || [];

      return {
        id: c.constellationId ?? c.id,
        constellationId: c.constellationId ?? c.id,
        name: c.name || "",
        description: c.description || "",
        createdAt: cDate,
        stars: rawStars.map((s) => ({
          id: s.starId ?? s.id,
          starId: s.starId ?? s.id,
          color: String(s.color || "").toUpperCase(),
          x: typeof s.x === "number" ? clamp01(s.x) : rand01(),
          y: typeof s.y === "number" ? clamp01(s.y) : rand01(),
          date: s.date || cDate,
        })),
        connections: (c.connections || c.connectionList || []).map((conn) => {
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
          return {
            startStarId: String(a),
            endStarId: String(b),
          };
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
    try {
      const raw = await getConstellation();
      console.log("[StarSky] raw constellations from API:", raw);
      const normalized = normalizeConstellations(raw);
      console.log("[StarSky] normalized constellations:", normalized);
      setConstellations(normalized);
      setLocked(normalized.length > 0);
    } catch (e) {
      console.error("별자리 불러오기 실패:", e);
      setConstellations([]);
      setLocked(false);
    }
  }, []);

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
    const baseStars = rawStars.map((s) => {
      const cached = cache.get(s.id);
      const x = s.x ?? cached?.x ?? rand01();
      const y = s.y ?? cached?.y ?? rand01();
      cache.set(s.id, { x, y });
      return { id: s.id, color: s.color, x, y, date: s.date };
    });
    setStars(baseStars);
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
    setConstellations((prev) =>
      prev.map((c) => {
        const cid = c.constellationId ?? c.id;
        if (cid !== constellationId) return c;
        return {
          ...c,
          stars: (c.stars || []).map((st) => {
            const key = st.starId ?? st.id;
            const newPos = movedStarsMap[key];
            if (!newPos) return st;
            return {
              ...st,
              x: newPos.x,
              y: newPos.y,
            };
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
    if (!locked) {
      const cnt = selectedStarIds.length;
      if (cnt < MIN_PICK || cnt > MAX_PICK) {
        alert(`별을 ${MIN_PICK}~${MAX_PICK}개 선택해주세요. (현재 ${cnt}개)`);
        return;
      }
    }
    setOpen(true);
  };

  const handleSubmit = async ({
    name,
    desc,
    lines = [],
    starPositions = {},
  }) => {
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
      await createConstellation({
        name: name?.trim() || "",
        description: desc?.trim() || "",
        stars: Object.entries(starPositions).map(([id, pos]) => ({
          starId: Number(id),
          x: pos.x,
          y: pos.y,
          date: new Date().toISOString().slice(0, 10),
        })),
        connections: (lines || []).map(([a, b]) => ({
          startStarId: Number(a),
          endStarId: Number(b),
        })),
      });

      await fetchConstellations();
    } catch (e) {
      console.error("별자리 생성/수정 실패:", e);
    }

    setSelectedStarIds([]);
    setLocked(true);
    setOpen(false);
  };

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
        constellationGroups={constellations}
        colorImageMap={COLOR_IMAGE}
        onMove={locked ? undefined : handleMove}
        onConstellationMove={handleConstellationMove}
        locked={locked}
        initialScaleOnLock={0.5}
        selectedIds={selectedStarIds}
        onSelectChange={setSelectedStarIds}
      />

      <ConstellationModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        initial={{ name: "", desc: "" }}
        colorImageMap={COLOR_IMAGE}
        stars={
          locked ? stars : stars.filter((s) => selectedStarIds.includes(s.id))
        }
      />
    </div>
  );
};

export default StarSky;
