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

import getNightSkyStar from "../apis/Star/getNightSkyStar";
import repositionStar from "../apis/Star/repositionStar";

// ⭐ 백엔드 별자리 API들
import getConstellation from "../apis/Constellation/getConstellation";
import createConstellation from "../apis/Constellation/createConstellation";
import repositionConstellation from "../apis/Constellation/repositionConstellation";

// 감정 → 이미지
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

// ⭐ 우리가 만든 별자리 이름을 기억할 로컬 키
const LOCAL_CONST_NAME_KEY = "starsky.constellationNameCache.v1";

// 별 id 배열 → 항상 같은 문자열로 변환
const makeStarIdsKey = (ids = []) =>
  ids
    .map((x) => String(x))
    .sort()
    .join(",");

// localStorage에서 캐시 읽기
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

// localStorage에 캐시 저장
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

  // 캘린더에서 온 별
  const [rawStars, setRawStars] = useState([]);
  const coordsCacheRef = useRef(new Map());
  const [stars, setStars] = useState([]);

  // 프론트에서 잠깐 기억해두는 "단일 모드" 별자리 정보
  const [constellation, setConstellation] = useState({
    name: "",
    desc: "",
    createdAt: "",
  });
  const [constellationEdges, setConstellationEdges] = useState([]);

  // 서버에서 온 별자리들(여러 개)
  const [serverConstellations, setServerConstellations] = useState([]);

  // 밤하늘이 "편집모드가 아니라 배치 잠겨있는 모드" 인지
  const [locked, setLocked] = useState(false);

  // 사용자가 클릭해서 선택한 별 id들 (새 별자리 만들 때만 사용)
  const [selectedStarIds, setSelectedStarIds] = useState([]);

  // 지금 화면의 2개월
  const [m1, m2] = useMemo(() => monthsForPair(pair), [pair]);

  // ⭐ 우리가 직접 만든 별자리 이름 캐시 (메모리)
  // 구조: { "<sortedStarIds>": { name, desc? } }
  const nameCacheRef = useRef(loadNameCache());

  // 캘린더에서 온 별 정규화
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

  // 서버에서 온 별자리 정규화 + ⭐우리 캐시로 이름 덮어쓰기
  const normalizeConstellations = (rawList = []) => {
    if (!Array.isArray(rawList)) return [];

    return rawList.map((c) => {
      const baseDate =
        c.createdAt ||
        c.createdDate ||
        c.date ||
        (c.stars?.[0]?.date ?? new Date().toISOString().slice(0, 10));

      const rawStars =
        c.stars || c.starts || c.starList || c.star || c.starEntities || [];

      const rawConnections =
        c.connections || c.connectionList || c.edges || c.lines || [];

      // 서버에서 온 별들의 id 배열
      const serverStarIds = rawStars
        .map((s) => s.starId ?? s.id)
        .filter(Boolean);

      // 우리가 예전에 모달에서 저장했던 이름이 있는지 확인
      const starKey = makeStarIdsKey(serverStarIds);
      const cached = nameCacheRef.current[starKey];

      const finalName =
        c.name && c.name.trim() !== "" ? c.name : cached?.name || "";
      const finalDesc =
        c.description && c.description.trim() !== ""
          ? c.description
          : cached?.desc || "";

      return {
        id: c.constellationId ?? c.id,
        constellationId: c.constellationId ?? c.id,
        name: finalName, // ⭐ 캐시 이름 사용
        description: finalDesc,
        createdAt: baseDate,
        // ✅ 중심좌표도 살려둠
        x: typeof c.x === "number" ? clamp01(c.x) : 0.5,
        y: typeof c.y === "number" ? clamp01(c.y) : 0.5,
        // ✅ 별 리스트
        stars: rawStars.map((s) => ({
          id: s.starId ?? s.id,
          starId: s.starId ?? s.id,
          color: String(s.color || "").toUpperCase(),
          x: typeof s.x === "number" ? clamp01(s.x) : 0.5,
          y: typeof s.y === "number" ? clamp01(s.y) : 0.5,
          date: s.date || baseDate,
        })),
        // ✅ 연결
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

  // ─────────────────────────────
  // 1) 달 별 불러오기
  // ─────────────────────────────
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

  // ─────────────────────────────
  // 2) 별자리 불러오기 (안 오면 앞/뒤달도 한 번씩 본다)
  // ─────────────────────────────
  const fetchConstellations = useCallback(async () => {
    const month = pair * 2 + 1; // 우리가 보고 있는 첫 달 (예: 11~12월 → 11)
    try {
      // 1. 우선 정상 호출
      const raw = await getConstellation(year, month);
      let normalized = normalizeConstellations(raw);

      // 2. 만약 비어있으면 → 백엔드가 month 인덱스를 다르게 받는 경우 대비해서 앞/뒤달도 한 번씩
      if (!normalized.length) {
        const alt = [];
        // 앞달
        const prevMonth = month - 1;
        if (prevMonth >= 1) {
          try {
            const rawPrev = await getConstellation(year, prevMonth);
            alt.push(...normalizeConstellations(rawPrev));
          } catch (e) {
            console.warn("이전 달 별자리 불러오기 실패:", e.message);
          }
        }
        // 뒷달
        const nextMonth = month + 1;
        if (nextMonth <= 12) {
          try {
            const rawNext = await getConstellation(year, nextMonth);
            alt.push(...normalizeConstellations(rawNext));
          } catch (e) {
            console.warn("다음 달 별자리 불러오기 실패:", e.message);
          }
        }
        // 앞/뒤달 결과라도 있으면 그걸로 사용
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

  // 최초 + 달 변경 시
  useEffect(() => {
    fetchNight();
    fetchConstellations();
  }, [fetchNight, fetchConstellations]);

  // 캘린더에서 새 별 생기면 다시
  useEffect(() => {
    const onUpdated = () => {
      fetchNight();
      fetchConstellations();
    };
    window.addEventListener("stars-updated", onUpdated);
    return () => window.removeEventListener("stars-updated", onUpdated);
  }, [fetchNight, fetchConstellations]);

  // 화면에 뿌릴 좌표 확정
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

  // ✅ 개별 별 이동 (캘린더에서 온 별은 언제든 옮기면 바로 저장)
  const handleMove = async (id, x, y) => {
    const nx = clamp01(x);
    const ny = clamp01(y);
    const prev = coordsCacheRef.current.get(id);
    // 1) 로컬 캐시/화면 즉시 반영
    coordsCacheRef.current.set(id, { x: nx, y: ny });
    setStars((arr) =>
      arr.map((s) => (s.id === id ? { ...s, x: nx, y: ny } : s))
    );
    // 2) 서버 반영
    try {
      await repositionStar(id, { x: nx, y: ny });
    } catch (e) {
      // 실패하면 원상복구
      if (prev) coordsCacheRef.current.set(id, prev);
      setStars((arr) => arr.map((s) => (s.id === id ? { ...s, ...prev } : s)));
      console.error("별 위치 저장 실패", e);
    }
  };

  // 별자리 전체 이동 + 서버 patch
  const handleConstellationMove = async (constellationId, movedStarsMap) => {
    // 1) 로컬 즉시 반영
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

    // 2) 서버 저장
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

  // 달 이동
  const handlePrev = () =>
    setCal(({ year, pair }) =>
      pair === 0 ? { year: year - 1, pair: 5 } : { year, pair: pair - 1 }
    );
  const handleNext = () =>
    setCal(({ year, pair }) =>
      pair === 5 ? { year: year + 1, pair: 0 } : { year, pair: pair + 1 }
    );

  // 선택한 별 7~14개만 모달로
  const handleGenerate = () => {
    const cnt = selectedStarIds.length;
    if (cnt < MIN_PICK || cnt > MAX_PICK) {
      alert(`별을 ${MIN_PICK}~${MAX_PICK}개 선택해주세요. (현재 ${cnt}개)`);
      return;
    }
    setOpen(true);
  };

  // 모달 → 저장(POST)
  const handleSubmit = async ({
    name,
    desc,
    lines = [],
    starPositions = {},
  }) => {
    // 프론트용으로도 기억
    const trimmedName = name?.trim() || "";
    const trimmedDesc = desc?.trim() || "";
    const createdAtStr = new Date().toISOString().slice(0, 10);

    setConstellation({
      name: trimmedName,
      desc: trimmedDesc,
      createdAt: createdAtStr,
    });
    setConstellationEdges(lines);

    // ⭐ 모달에서 사용자가 지정한 별 id들 → 캐시에 먼저 넣어둔다
    const starIdsFromModal = Object.keys(starPositions || {});
    if (starIdsFromModal.length > 0) {
      const key = makeStarIdsKey(starIdsFromModal);
      nameCacheRef.current = {
        ...nameCacheRef.current,
        [key]: {
          name: trimmedName || "미지정 별자리",
          desc: trimmedDesc || "",
        },
      };
      saveNameCache(nameCacheRef.current);
    }

    // 프론트 좌표도 반영
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

      // 새로 만든 별자리를 다시 불러와서 화면에 고정
      await fetchConstellations();
      setLocked(true);
    } catch (e) {
      console.error("별자리 생성/수정 실패:", e);
    }

    setSelectedStarIds([]);
    setOpen(false);
  };

  // 지금 화면(짝달)에 해당하는 별자리만
  const filteredConstellations = useMemo(() => {
    if (!serverConstellations.length) return [];
    return serverConstellations.filter((c) => {
      // 이 별자리 안의 별 중 이 달(짝달)에 해당하는 게 있는가
      const hasStarInThisPair = (c.stars || []).some((st) => {
        if (!st.date) return false;
        const m = new Date(st.date).getMonth() + 1;
        return m === m1 || m === m2;
      });

      if (hasStarInThisPair) return true;

      // 없으면 별자리 생성일로 한 번 더 체크
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
        // 서버에서 별자리 왔으면 다중 모드
        constellationGroups={useMultipleMode ? filteredConstellations : null}
        // ✅ 항상 넘겨서 "캘린더에서 온 별"은 드래그하면 바로 저장되게
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
        // 단일 모드에서 전체 이동/스케일 끝났을 때 → 별 좌표 PATCH
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

      {/* 선택한 별만 모달로 전달 */}
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
