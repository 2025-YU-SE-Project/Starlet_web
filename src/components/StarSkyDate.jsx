import React, { useEffect, useMemo, useRef, useState } from "react";

const MONTH_ABBR = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

const clamp01 = (v) => Math.max(0, Math.min(1, v));

const DRAG_SELECT_THRESHOLD_PX = 6;
const clampToView = (v, pad = 0.02) => Math.max(pad, Math.min(1 - pad, v));
const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

const EDGE_PAD = 0.02;
const LABEL_TOP_FLIP_Y = 0.1;
const TARGET_CONSTELLATION_SIZE = 0.18;

function avoidUiZones(nx, ny, rect) {
  if (!rect) return { x: nx, y: ny };
  let px = nx * rect.width;
  let py = ny * rect.height;

  const zones = [
    // 1) 좌측 상단 햄버거 메뉴 영역
    { x1: 0, y1: 0, x2: 70, y2: 80 },

    // 2) 우측 상단 Generate 텍스트 근처
    { x1: rect.width - 150, y1: 0, x2: rect.width, y2: 70 },

    // 3) 우측 크기 조절 슬라이더 전체 영역
    {
      x1: rect.width - 90,
      y1: rect.height * 0.1,
      x2: rect.width,
      y2: rect.height * 0.95,
    },

    // 4) 하단 월/년도 네비게이션 영역
    {
      x1: rect.width / 2 - 220,
      y1: rect.height - 110,
      x2: rect.width / 2 + 220,
      y2: rect.height,
    },
  ];

  const margin = 4;

  zones.forEach((z) => {
    if (px >= z.x1 && px <= z.x2 && py >= z.y1 && py <= z.y2) {
      const dLeft = px - z.x1;
      const dRight = z.x2 - px;
      const dTop = py - z.y1;
      const dBottom = z.y2 - py;

      const minD = Math.min(dLeft, dRight, dTop, dBottom);

      if (minD === dLeft) px = z.x1 - margin;
      else if (minD === dRight) px = z.x2 + margin;
      else if (minD === dTop) py = z.y1 - margin;
      else py = z.y2 + margin;
    }
  });

  const nx2 = clampToView(px / rect.width);
  const ny2 = clampToView(py / rect.height);
  return { x: nx2, y: ny2 };
}

function getTodayLocal() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function computeBBoxFromPoints(points) {
  if (!points || points.length === 0) return null;
  let minX = 1,
    minY = 1,
    maxX = 0,
    maxY = 0;
  points.forEach(({ x, y }) => {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  });
  const w = Math.max(0.001, maxX - minX);
  const h = Math.max(0.001, maxY - minY);
  return {
    minX,
    minY,
    maxX,
    maxY,
    w,
    h,
    cx: (minX + maxX) / 2,
    cy: (minY + maxY) / 2,
  };
}

function normalizeConstellationSize(
  stars,
  targetSize = TARGET_CONSTELLATION_SIZE
) {
  if (!stars || stars.length === 0) return stars;

  const pts = stars.map((s) => ({
    x: typeof s.x === "number" ? clamp01(s.x) : 0.5,
    y: typeof s.y === "number" ? clamp01(s.y) : 0.5,
  }));

  const box = computeBBoxFromPoints(pts);
  if (!box) return stars;

  const baseSize = Math.max(box.w, box.h);
  if (baseSize === 0) return stars;

  const scale = targetSize / baseSize;

  const scaledStars = stars.map((s, idx) => {
    const p = pts[idx];
    const dx = p.x - box.cx;
    const dy = p.y - box.cy;

    const nx = clampToView(box.cx + dx * scale);
    const ny = clampToView(box.cy + dy * scale);

    return {
      ...s,
      x: nx,
      y: ny,
      date: s.date || getTodayLocal(),
    };
  });

  return scaledStars;
}

function fitMapIntoView(map, pad = 0) {
  const pts = Object.values(map);
  const box = computeBBoxFromPoints(pts);
  if (!box) return map;

  let shiftX = 0;
  let shiftY = 0;

  if (box.minX < pad) shiftX = pad - box.minX;
  if (box.minY < pad) shiftY = pad - box.minY;

  const afterMaxX = box.maxX + shiftX;
  const afterMaxY = box.maxY + shiftY;

  if (afterMaxX > 1 - pad) {
    shiftX += 1 - pad - afterMaxX;
  }
  if (afterMaxY > 1 - pad) {
    shiftY += 1 - pad - afterMaxY;
  }

  const fitted = {};
  Object.entries(map).forEach(([id, p]) => {
    fitted[id] = {
      x: p.x + shiftX,
      y: p.y + shiftY,
    };
  });
  return fitted;
}

// 현재는 쓰이지 않지만 혹시 기본 최소 크기 강제하고 싶을 때 사용 가능
function ensureMinSize(baseMap, minSize = 0.12) {
  const pts = Object.values(baseMap);
  const box = computeBBoxFromPoints(pts);
  if (!box) return baseMap;

  const { w, h, cx, cy } = box;
  const need = Math.max(minSize / w, minSize / h, 1);
  if (need === 1) return baseMap;

  const bigger = {};
  Object.entries(baseMap).forEach(([id, p]) => {
    const dx = p.x - cx;
    const dy = p.y - cy;
    bigger[id] = {
      x: cx + dx * need,
      y: cy + dy * need,
    };
  });

  return fitMapIntoView(bigger, 0);
}

export default function StarSkyDate({
  year,
  monthPairIndex,
  onPrev,
  onNext,
  stars = [],
  edges = [],
  constellationGroups = null,
  colorImageMap = {},
  onMove,
  locked = false,
  onTransform,
  onTransformEnd,
  onApply,
  initialScaleOnLock = 0.5, // 현재는 안 쓰지만 그대로 둠
  constellationMeta = { name: "", createdAt: "" },
  selectedIds = [],
  onSelectChange,
  onConstellationMove,
}) {
  const containerRef = useRef(null);

  const baseConstShapesRef = useRef({});
  const appliedMapRef = useRef({});
  const committedConstMapRef = useRef({});
  const multiScaleOriginRef = useRef({});
  const scaleBaseRef = useRef({});

  const constellationCreatedAtRef = useRef({});

  const firstMonth = monthPairIndex * 2;
  const secondMonth = firstMonth + 1;

  const inCurrentPair = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return false;
    const m = d.getMonth();
    const y = d.getFullYear();
    return y === year && (m === firstMonth || m === secondMonth);
  };

  const filteredStars = useMemo(
    () => stars.filter((s) => inCurrentPair(s.date)),
    [stars, year, firstMonth, secondMonth]
  );

  const currentPairIdSet = useMemo(() => {
    const set = new Set();
    filteredStars.forEach((s) => set.add(String(s.id)));
    return set;
  }, [filteredStars]);

  const filteredConstellationGroups = useMemo(() => {
    if (!Array.isArray(constellationGroups) || !constellationGroups.length) {
      return [];
    }

    return constellationGroups.map((g) => {
      const rawStars = g.stars || [];

      // ⭐ raw 좌표 기준으로 별자리가 얼마나 퍼져 있는지 먼저 계산
      const rawPts = rawStars.map((s) => ({
        x: typeof s.x === "number" ? clamp01(s.x) : 0.5,
        y: typeof s.y === "number" ? clamp01(s.y) : 0.5,
      }));
      const rawBox = computeBBoxFromPoints(rawPts);
      const rawSize = rawBox ? Math.max(rawBox.w, rawBox.h) : 0;

      // ✨ 사용자가 한 번이라도 크기를 조정해서 저장한 별자리인지 여부
      const isScaleEdited =
        typeof g.scale === "number" &&
        Number.isFinite(g.scale) &&
        g.scale !== 1;

      // 👉 scale 안 만졌고 + 너무 큰 별자리인 경우에만 normalize
      const needNormalize = rawSize > 0.3 && !isScaleEdited;

      const stars = needNormalize
        ? normalizeConstellationSize(rawStars)
        : rawStars;

      if (needNormalize && !baseConstShapesRef.current[g.id]) {
        const base = {};
        stars.forEach((s) => {
          const key = s.id ?? s.starId;
          if (key == null) return;
          base[key] = { x: s.x, y: s.y };
        });
        baseConstShapesRef.current[g.id] = base;
      }

      return {
        ...g,
        stars,
      };
    });
  }, [constellationGroups]);

  useEffect(() => {
    if (!filteredConstellationGroups.length) return;
    const store = constellationCreatedAtRef.current;

    filteredConstellationGroups.forEach((g) => {
      const id = g.id;
      if (!id) return;

      const modalPickedDate =
        g.constellationCreatedAt ||
        g.constellationDate ||
        g.selectedDate ||
        g.dateFromModal ||
        g.createAt ||
        g.createdAt ||
        g.created_at ||
        null;

      if (modalPickedDate) {
        store[id] = String(modalPickedDate).slice(0, 10);
      }
    });
  }, [filteredConstellationGroups]);

  const [previewMap, setPreviewMap] = useState(null);
  const [isSelected, setIsSelected] = useState(false);
  const groupDragRef = useRef(null);
  const [starDrag, setStarDrag] = useState(null);
  const [hover, setHover] = useState({ show: false, x: 0, y: 0 });

  const [scaleUI, setScaleUI] = useState(1.0);
  const scaleRef = useRef(1);
  const didInitialScaleRef = useRef(false);
  const committedMapRef = useRef(null);
  const singleScaleOriginRef = useRef(null);
  const [lastDirection, setLastDirection] = useState(null); // "up" | "down" | null

  const [activeConstellationId, setActiveConstellationId] = useState(null);
  const [scaleUIMap, setScaleUIMap] = useState({});

  const originalPositionRef = useRef(null);
  const [pendingApply, setPendingApply] = useState(false);

  const [appliedVersion, setAppliedVersion] = useState(0);

  const [hoveredEdgeSingle, setHoveredEdgeSingle] = useState(false);
  const [hoveredConstellationId, setHoveredConstellationId] = useState(null);
  const [allowPulseAnim, setAllowPulseAnim] = useState(false);
  const hasSelectedOnceRef = useRef(false);

  const multipleMode =
    Array.isArray(filteredConstellationGroups) &&
    filteredConstellationGroups.length > 0;

  const prevMultipleRef = useRef(false);
  useEffect(() => {
    const wasMulti = prevMultipleRef.current;
    if (!wasMulti && multipleMode) {
      // 단일 → 멀티 모드 전환 시 단일 관련 상태 초기화
      setPreviewMap(null);
      setIsSelected(false);
      setActiveConstellationId(null);
      setPendingApply(false);
      appliedMapRef.current = {};
      committedMapRef.current = null;
      singleScaleOriginRef.current = null;
      setScaleUI(1.0);
      scaleRef.current = 1;
      setScaleUIMap({});
      setLastDirection(null);
    }
    prevMultipleRef.current = multipleMode;
  }, [multipleMode]);

  // 년/월 쌍이 바뀔 때 전체 내부 상태 초기화
  useEffect(() => {
    baseConstShapesRef.current = {};

    appliedMapRef.current = {};
    committedConstMapRef.current = {};
    committedMapRef.current = null;
    singleScaleOriginRef.current = null;
    multiScaleOriginRef.current = {};

    scaleBaseRef.current = {};

    originalPositionRef.current = null;
    groupDragRef.current = null;
    setPreviewMap(null);
    setIsSelected(false);
    setPendingApply(false);
    setScaleUI(1.0);
    scaleRef.current = 1;
    setScaleUIMap({});
    setLastDirection(null);
    setHoveredEdgeSingle(false);
    setHoveredConstellationId(null);
    setActiveConstellationId(null);
  }, [year, monthPairIndex]);

  const positionOf = (s) => {
    let p;

    if (previewMap && previewMap[s.id]) {
      p = previewMap[s.id];
    } else {
      const appliedSingle = appliedMapRef.current["single"];
      if (appliedSingle && appliedSingle[s.id]) {
        p = appliedSingle[s.id];
      } else {
        p = { x: s.x, y: s.y };
      }
    }

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return p;

    return avoidUiZones(p.x, p.y, rect);
  };

  const livePoints = useMemo(
    () => filteredStars.map((s) => positionOf(s)),
    [filteredStars, previewMap, appliedVersion]
  );
  const liveBBox = useMemo(
    () => computeBBoxFromPoints(livePoints),
    [livePoints]
  );

  useEffect(() => {
    if (multipleMode) {
      didInitialScaleRef.current = false;
      committedMapRef.current = null;
      return;
    }

    // 단일 별자리 모드: 잠금 상태 진입 시 최초 한 번 서버 좌표를 기준으로 사용
    if (locked && !didInitialScaleRef.current) {
      didInitialScaleRef.current = true;

      const base = Object.fromEntries(
        filteredStars.map((s) => [s.id, { x: s.x, y: s.y }])
      );

      singleScaleOriginRef.current = base;
      appliedMapRef.current["single"] = base;

      // 🔥 변경 부분: 기본값을 무조건 1.0으로, 그리고 scaleRef 도 맞춰 놓기
      const remembered = scaleUIMap["single"];
      const initialScale =
        typeof remembered === "number" && Number.isFinite(remembered)
          ? remembered
          : 1.0;

      setScaleUI(initialScale);
      scaleRef.current = initialScale; // ★ 기준 스케일도 함께 세팅

      setPreviewMap(null);
      onTransform?.(base);
      onTransformEnd?.(base);
      setIsSelected(false);
      setAppliedVersion((v) => v + 1);
    }
  }, [
    locked,
    filteredStars,
    initialScaleOnLock,
    filteredConstellationGroups,
    multipleMode,
    onTransform,
    onTransformEnd,
  ]);
  useEffect(() => {
    if (!locked) {
      didInitialScaleRef.current = false;
      committedMapRef.current = null;
      setPreviewMap(null);
      setIsSelected(false);
      // ❌ scaleUI, scaleRef, scaleUIMap은 건드리지 않음
      appliedMapRef.current = {};
      singleScaleOriginRef.current = null;
      multiScaleOriginRef.current = {};

      scaleBaseRef.current = {};
      setPendingApply(false);
      setHoveredEdgeSingle(false);
      setHoveredConstellationId(null);
      setActiveConstellationId(null);
      setLastDirection(null);
      setAppliedVersion((v) => v + 1);
    }
  }, [locked]);

  useEffect(() => {
    if (!locked) {
      // 잠금 풀리면 다시 초기화
      setAllowPulseAnim(false);
      hasSelectedOnceRef.current = false;
      return;
    }

    if (isSelected) {
      // ⭐ 처음 선택됐을 때: 애니메이션 끔 (한 번만)
      if (!hasSelectedOnceRef.current) {
        hasSelectedOnceRef.current = true;
        setAllowPulseAnim(false);
      } else {
        // 두 번째부터는 애니메이션 켬
        setAllowPulseAnim(true);
      }
    }
  }, [locked, isSelected]);

  const toRel = (clientX, clientY) => {
    const r = containerRef.current?.getBoundingClientRect();
    if (!r || r.width === 0 || r.height === 0) {
      return { x: 0.5, y: 0.5 };
    }
    return {
      x: clamp01((clientX - r.left) / r.width),
      y: clamp01((clientY - r.top) / r.height),
    };
  };

  const getConstellationMapForDrag = (constellation) => {
    const constId = constellation.id;
    const appliedForThis = appliedMapRef.current[constId];
    const baseMap = baseConstShapesRef.current[constId];
    const usePreview = previewMap && constId === activeConstellationId;

    const map = {};
    (constellation.stars || []).forEach((s) => {
      const key = s.id ?? s.starId;
      let p = null;

      if (usePreview && previewMap[key]) {
        p = previewMap[key];
      } else if (appliedForThis && appliedForThis[key]) {
        p = appliedForThis[key];
      } else if (baseMap && baseMap[key]) {
        p = baseMap[key];
      } else {
        p = { x: s.x, y: s.y };
      }

      map[key] = { x: p.x, y: p.y };
    });

    return map;
  };

  const startMoveDragSingle = (e) => {
    if (!locked || !liveBBox || !containerRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    try {
      e.currentTarget?.setPointerCapture?.(e.pointerId);
    } catch {}
    const startRel = toRel(e.clientX, e.clientY);

    const baseMap =
      previewMap ||
      appliedMapRef.current["single"] ||
      Object.fromEntries(filteredStars.map((s) => [s.id, { x: s.x, y: s.y }]));

    groupDragRef.current = {
      pointerId: e.pointerId,
      startRel,
      bbox0: computeBBoxFromPoints(Object.values(baseMap)),
      originMap: baseMap,
      mode: "single",
    };

    // 🔹 이번 편집 세션용 기준은 새로 만들 거라 초기화
    delete scaleBaseRef.current["single"];

    // 🔹 슬라이더는 "이전에 적용했던 스케일"을 기억해서 그 위치에서 시작
    const remembered = scaleUIMap["single"];
    const initialScale =
      typeof remembered === "number" && Number.isFinite(remembered)
        ? remembered
        : scaleRef.current ?? 1.0;

    setScaleUI(initialScale);

    setIsSelected(true);
  };

  const startMoveDragConstellation = (e, constellation) => {
    if (!locked || !containerRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    try {
      e.currentTarget?.setPointerCapture?.(e.pointerId);
    } catch {}

    const constId = constellation.id;
    const startRel = toRel(e.clientX, e.clientY);

    const originMap = getConstellationMapForDrag(constellation);
    const bbox0 = computeBBoxFromPoints(Object.values(originMap));

    groupDragRef.current = {
      pointerId: e.pointerId,
      startRel,
      bbox0,
      originMap,
      mode: "multi",
      constellationId: constId,
    };

    setActiveConstellationId(constId);

    if (!multiScaleOriginRef.current[constId]) {
      multiScaleOriginRef.current[constId] = deepClone(originMap);
    }

    // 🔹 이번 세션 기준 스케일 정보는 새로 계산할 거라 초기화
    delete scaleBaseRef.current[constId];

    // 🔹 슬라이더는 "이 별자리에 마지막으로 적용했던 스케일"을 기억
    let remembered = scaleUIMap[constId];
    if (!(typeof remembered === "number" && Number.isFinite(remembered))) {
      const fromServer =
        typeof constellation.scale === "number" &&
        Number.isFinite(constellation.scale)
          ? Math.max(0.5, Math.min(2.0, constellation.scale))
          : 1.0;
      remembered = fromServer;
      setScaleUIMap((prev) => ({
        ...prev,
        [constId]: fromServer,
      }));
    }
    setScaleUI(remembered);

    setIsSelected(true);
    setPendingApply(true);
    originalPositionRef.current = deepClone(originMap);
  };

  const onGroupPointerMove = (e) => {
    const drag = groupDragRef.current;
    if (!drag || !containerRef.current) return;
    e.preventDefault();

    const curRel = toRel(e.clientX, e.clientY);
    const dxRelRaw = curRel.x - drag.startRel.x;
    const dyRelRaw = curRel.y - drag.startRel.y;

    const { minX, minY, maxX, maxY } = drag.bbox0 || {};
    if (minX == null || minY == null || maxX == null || maxY == null) {
      return;
    }

    const dxMin = EDGE_PAD - minX;
    const dxMax = 1 - EDGE_PAD - maxX;
    const dyMin = EDGE_PAD - minY;
    const dyMax = 1 - EDGE_PAD - maxY;

    const dxRel = Math.max(dxMin, Math.min(dxMax, dxRelRaw));
    const dyRel = Math.max(dyMin, Math.min(dyMax, dyRelRaw));

    const map = {};
    Object.entries(drag.originMap || {}).forEach(([id, p]) => {
      map[id] = { x: p.x + dxRel, y: p.y + dyRel };
    });

    setPreviewMap(map);
    onTransform?.(map);
  };

  const onGroupPointerUp = (e) => {
    const drag = groupDragRef.current;
    if (!drag) return;
    e.preventDefault();
    try {
      e.currentTarget?.releasePointerCapture?.(drag.pointerId);
    } catch {}
    groupDragRef.current = null;

    if (drag.mode === "single") {
      if (previewMap) {
        appliedMapRef.current["single"] = deepClone(previewMap);
        onTransformEnd?.(previewMap);
        setAppliedVersion((v) => v + 1);
      }
    } else if (drag.mode === "multi") {
      const constId = drag.constellationId;
      if (previewMap) {
        // ✅ 이동 후 최종 위치는 committedConstMapRef에만 저장
        committedConstMapRef.current[constId] = deepClone(previewMap);
      } else if (appliedMapRef.current[constId]) {
        committedConstMapRef.current[constId] = deepClone(
          appliedMapRef.current[constId]
        );
      }
    }
  };

  const onBackgroundPointerDown = (e) => {
    if (!locked) return;
    e.preventDefault();
    e.stopPropagation();

    const currentActiveId = activeConstellationId;

    setIsSelected(false);
    setActiveConstellationId(null);
    setHover({ show: false, x: 0, y: 0 });
    setHoveredEdgeSingle(false);
    setHoveredConstellationId(null);
    setLastDirection(null);

    // 아직 적용 안 한 상태였다면 원래 위치로 되돌리기
    if (pendingApply) {
      if (originalPositionRef.current) {
        const saveKey =
          multipleMode && currentActiveId ? currentActiveId : "single";

        appliedMapRef.current[saveKey] = deepClone(originalPositionRef.current);
        setPreviewMap(null);
        onTransformEnd?.(originalPositionRef.current);
        setAppliedVersion((v) => v + 1);
      }
      setPendingApply(false);
    }

    const saveKey =
      multipleMode && currentActiveId ? currentActiveId : "single";
    if (scaleBaseRef.current[saveKey]) {
      delete scaleBaseRef.current[saveKey];
    }
  };

  const onStarPointerDown = (e, star) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      e.currentTarget.setPointerCapture?.(e.pointerId);
    } catch {}
    const cur = (previewMap && previewMap[star.id]) ||
      (appliedMapRef.current["single"] &&
        appliedMapRef.current["single"][star.id]) || {
        x: star.x,
        y: star.y,
      };
    setStarDrag({
      id: star.id,
      startXpx: e.clientX,
      startYpx: e.clientY,
      moved: false,
      originPos: { ...cur },
      pointerId: e.pointerId,
    });
  };

  const onStarPointerMove = (e, star) => {
    if (!starDrag || starDrag.id !== star.id || !containerRef.current) return;
    e.preventDefault();

    const r = containerRef.current.getBoundingClientRect();
    if (!r || r.width === 0 || r.height === 0) return;

    const dxPx = e.clientX - starDrag.startXpx;
    const dyPx = e.clientY - starDrag.startYpx;

    const moved =
      starDrag.moved || Math.hypot(dxPx, dyPx) >= DRAG_SELECT_THRESHOLD_PX;

    let nx = clampToView(starDrag.originPos.x + dxPx / r.width);
    let ny = clampToView(starDrag.originPos.y + dyPx / r.height);

    const adjusted = avoidUiZones(nx, ny, r);
    nx = adjusted.x;
    ny = adjusted.y;

    const base =
      previewMap ||
      appliedMapRef.current["single"] ||
      Object.fromEntries(filteredStars.map((s) => [s.id, { x: s.x, y: s.y }]));
    const next = { ...base, [star.id]: { x: nx, y: ny } };

    setStarDrag((s) => (s ? { ...s, moved } : s));
    setPreviewMap(next);

    const isCalendarStar = filteredStars.some((fs) => fs.id === star.id);
    if (isCalendarStar) {
      onMove?.(star.id, nx, ny);
    }
  };

  const onStarPointerUp = (e, star) => {
    if (!starDrag || starDrag.id !== star.id) return;
    e.preventDefault();
    try {
      e.currentTarget.releasePointerCapture?.(starDrag.pointerId);
    } catch {}

    if (!starDrag.moved) {
      const isCalendarStar = filteredStars.some((fs) => fs.id === star.id);
      if (isCalendarStar && typeof onSelectChange === "function") {
        const hasFromOtherPair = selectedIds.some(
          (id) => !currentPairIdSet.has(String(id))
        );
        if (hasFromOtherPair) {
          window.alert("서로 다른 달의 별은 함께 별자리를 만들 수 없습니다.");
          setStarDrag(null);
          return;
        }

        if (selectedIds.includes(star.id)) {
          onSelectChange(selectedIds.filter((x) => x !== star.id));
        } else {
          onSelectChange([...selectedIds, star.id]);
        }
      }
    } else {
      if (previewMap) {
        appliedMapRef.current["single"] = deepClone(previewMap);
        setAppliedVersion((v) => v + 1);
      }
    }

    setStarDrag(null);
  };

  const applyScalePreviewSingle = (newScale, { commit = false } = {}) => {
    const sAbs = Math.max(0.5, Math.min(2.0, newScale));

    const targetId = activeConstellationId;
    const saveKey = multipleMode && targetId ? targetId : "single";

    // 🔹 이번 편집 세션에서 처음 스케일을 바꿀 때,
    //    "그 순간 보이던 모양 + 그때의 절대 스케일(baseScale)"을 기준으로 저장
    if (!scaleBaseRef.current[saveKey]) {
      let currentShape = null;

      if (
        previewMap &&
        (saveKey === "single" || targetId === activeConstellationId)
      ) {
        currentShape = previewMap;
      } else if (appliedMapRef.current[saveKey]) {
        currentShape = appliedMapRef.current[saveKey];
      } else if (multipleMode && targetId) {
        const targetConst = filteredConstellationGroups.find(
          (g) => g.id === targetId
        );
        if (!targetConst) return;
        currentShape = {};
        (targetConst.stars || []).forEach((s) => {
          const realId = s.id ?? s.starId;
          currentShape[realId] = { x: s.x, y: s.y };
        });
      } else {
        // 단일 모드: 현재 별들 좌표
        currentShape = Object.fromEntries(
          filteredStars.map((s) => [s.id, { x: s.x, y: s.y }])
        );
      }

      // 이때의 "기준 절대 스케일" (이전에 적용되어 있던 값)
      // 수정
      const baseScale =
        typeof scaleUIMap[saveKey] === "number" &&
        Number.isFinite(scaleUIMap[saveKey])
          ? scaleUIMap[saveKey]
          : 1.0;

      scaleBaseRef.current[saveKey] = {
        shape: deepClone(currentShape),
        baseScale,
      };
    }

    const baseEntry = scaleBaseRef.current[saveKey];
    const base = baseEntry.shape;
    const baseScale =
      typeof baseEntry.baseScale === "number" &&
      Number.isFinite(baseEntry.baseScale)
        ? baseEntry.baseScale
        : 1.0;

    const baseBox = computeBBoxFromPoints(Object.values(base));
    if (!baseBox) return;

    // 🔹 "지금 절대 스케일 / 기준 절대 스케일" 만큼만 다시 키우거나 줄이기
    const factor = sAbs / baseScale;

    const scaled = {};
    Object.entries(base).forEach(([id, p]) => {
      const dx = p.x - baseBox.cx;
      const dy = p.y - baseBox.cy;
      scaled[id] = {
        x: baseBox.cx + dx * factor,
        y: baseBox.cy + dy * factor,
      };
    });

    const fitted = fitMapIntoView(scaled, 0);

    if (!pendingApply) {
      const original = appliedMapRef.current[saveKey] || base;
      originalPositionRef.current = deepClone(original);
    }

    setPreviewMap(fitted);
    onTransform?.(fitted);
    setPendingApply(true);

    if (commit) {
      appliedMapRef.current[saveKey] = deepClone(fitted);

      // 세션 끝났으니 기준은 다음 번에 다시 계산해도 되고,
      // 남겨둬도 크게 문제 되진 않지만 깔끔하게 지우고 싶으면:
      // delete scaleBaseRef.current[saveKey];

      // 새 "절대 스케일" 저장 (다음 편집 때 슬라이더 위치용)
      scaleRef.current = sAbs;
      setScaleUI(sAbs);
      setScaleUIMap((prev) => ({
        ...prev,
        [saveKey]: sAbs,
      }));

      onTransformEnd?.(fitted);
      setPendingApply(false);
      setAppliedVersion((v) => v + 1);
    }
  };

  const showTooltip = (e) => {
    const r = containerRef.current?.getBoundingClientRect();
    if (!r) return;
    setHover({ show: true, x: e.clientX - r.left, y: e.clientY - r.top });
  };
  const hideTooltip = () => setHover({ show: false, x: 0, y: 0 });

  const activeConst = multipleMode
    ? filteredConstellationGroups.find(
        (g) => g.id === hoveredConstellationId
      ) ||
      filteredConstellationGroups.find((g) => g.id === activeConstellationId)
    : null;

  const activeConstBBox = (() => {
    if (!multipleMode || !activeConst) return null;
    const applied = appliedMapRef.current[activeConst.id];
    const base = baseConstShapesRef.current[activeConst.id];
    const pts = (activeConst.stars || []).map((s) => {
      const id = s.id ?? s.starId;
      if (
        previewMap &&
        activeConst.id === activeConstellationId &&
        previewMap[id]
      )
        return previewMap[id];
      if (applied && applied[id]) return applied[id];
      if (base && base[id]) return base[id];
      return { x: s.x, y: s.y };
    });
    return computeBBoxFromPoints(pts);
  })();

  const showLabelSingle =
    !multipleMode && locked && hoveredEdgeSingle && liveBBox;

  const constellationStarIdSet = useMemo(() => {
    if (!multipleMode) return null;
    const set = new Set();
    filteredConstellationGroups.forEach((g) => {
      (g.stars || []).forEach((s) => {
        const realId = String(s.id ?? s.starId);
        set.add(realId);
      });
    });
    return set;
  }, [multipleMode, filteredConstellationGroups]);

  const labelStyleSingle = (() => {
    if (!showLabelSingle || !liveBBox) return null;

    const shouldFlipLeft = liveBBox.maxX > 0.9;
    const offset = 20;

    if (shouldFlipLeft) {
      return {
        left: `${liveBBox.minX * 100}%`,
        top: `${liveBBox.cy * 100}%`,
        transform: `translate(calc(-100% - ${offset}px), -50%)`,
      };
    }

    return {
      left: `${liveBBox.maxX * 100}%`,
      top: `${liveBBox.cy * 100}%`,
      transform: `translate(${offset}px, -50%)`,
    };
  })();

  const labelStyleMulti = (() => {
    if (!multipleMode || !activeConstBBox) return null;

    const shouldFlipLeft = activeConstBBox.maxX > 0.9;
    const offset = 15;

    if (shouldFlipLeft) {
      return {
        left: `${activeConstBBox.minX * 100}%`,
        top: `${activeConstBBox.cy * 100}%`,
        transform: `translate(calc(-100% - ${offset}px), -50%)`,
      };
    }

    return {
      left: `${activeConstBBox.maxX * 100}%`,
      top: `${activeConstBBox.cy * 100}%`,
      transform: `translate(${offset}px, -50%)`,
    };
  })();

  useEffect(() => {
    if (!locked || !isSelected) return;
    if (lastDirection === null) {
      if (scaleUI > 1.0) setLastDirection("up");
      else if (scaleUI < 1.0) setLastDirection("down");
    }
  }, [locked, isSelected, scaleUI, lastDirection]);

  let rawRatio;
  if (scaleUI <= 1) {
    rawRatio = ((scaleUI - 0.5) / 0.5) * 0.5;
  } else {
    rawRatio = 0.5 + ((scaleUI - 1.0) / 1.0) * 0.5;
  }
  const sliderRatio = Math.max(0, Math.min(1, rawRatio));
  const safeRatio = sliderRatio * 0.92;

  const centerRatio = 0.5;

  // 방향(lastDirection)에 상관 없이,
  // - center 아래에 있으면 아래쪽 영역을 채우고
  // - center 위로 올라가면 위쪽 영역을 채우도록
  let upFillStyle = { opacity: 0 };
  let downFillStyle = { opacity: 0 };

  if (sliderRatio >= centerRatio) {
    // 위쪽 영역 채우기 (center ~ sliderRatio)
    upFillStyle = {
      bottom: `${centerRatio * 100}%`,
      height: `${(sliderRatio - centerRatio) * 100}%`,
    };
  } else {
    // 아래쪽 영역 채우기 (sliderRatio ~ center)
    downFillStyle = {
      bottom: `${sliderRatio * 100}%`,
      height: `${(centerRatio - sliderRatio) * 100}%`,
    };
  }

  return (
    <div className="fixed inset-0 select-none">
      <div
        ref={containerRef}
        className="absolute inset-0"
        style={{ touchAction: "none", cursor: locked ? "default" : "default" }}
        onPointerDown={onBackgroundPointerDown}
        onPointerMove={onGroupPointerMove}
        onPointerUp={onGroupPointerUp}
      >
        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 2 }}>
          {/* 단일 별자리 모드: edges */}
          {!multipleMode &&
            edges.map(([a, b], idx) => {
              const pa = filteredStars.find((s) => s.id === a);
              const pb = filteredStars.find((s) => s.id === b);
              if (!pa || !pb) return null;
              const p1 = positionOf(pa);
              const p2 = positionOf(pb);
              return (
                <g key={idx}>
                  {locked && isSelected && (
                    <line
                      x1={`${p1.x * 100}%`}
                      y1={`${p1.y * 100}%`}
                      x2={`${p2.x * 100}%`}
                      y2={`${p2.y * 100}%`}
                      stroke="#7cf5ff"
                      strokeOpacity="0.22"
                      strokeWidth="4"
                      strokeLinecap="round"
                      pointerEvents="none"
                    />
                  )}
                  <line
                    x1={`${p1.x * 100}%`}
                    y1={`${p1.y * 100}%`}
                    x2={`${p2.x * 100}%`}
                    y2={`${p2.y * 100}%`}
                    stroke="#ffffff"
                    strokeOpacity="0.95"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    style={{ cursor: locked ? "pointer" : "default" }}
                    onPointerDown={(e) => {
                      if (!multipleMode && locked) startMoveDragSingle(e);
                    }}
                    onMouseEnter={(e) => {
                      setHoveredEdgeSingle(true);
                      showTooltip(e);
                    }}
                    onMouseLeave={() => {
                      setHoveredEdgeSingle(false);
                      if (!isSelected) hideTooltip();
                    }}
                  />
                </g>
              );
            })}

          {/* 멀티 별자리 모드: 각 별자리의 edges */}
          {multipleMode &&
            filteredConstellationGroups.map((g) => {
              const appliedForThis = appliedMapRef.current[g.id] || null;
              const baseMap = baseConstShapesRef.current[g.id] || null;
              return (g.connections || []).map((conn, idx) => {
                const [a, b] = Array.isArray(conn)
                  ? conn
                  : [conn.startStarId, conn.endStarId];
                const pa = (g.stars || []).find(
                  (s) => String(s.id ?? s.starId) === String(a)
                );
                const pb = (g.stars || []).find(
                  (s) => String(s.id ?? s.starId) === String(b)
                );
                if (!pa || !pb) return null;

                const paId = pa.id ?? pa.starId;
                const pbId = pb.id ?? pb.starId;

                const p1 = (previewMap &&
                  g.id === activeConstellationId &&
                  previewMap[paId]) ||
                  (appliedForThis && appliedForThis[paId]) ||
                  (baseMap && baseMap[paId]) || {
                    x: pa.x,
                    y: pa.y,
                  };
                const p2 = (previewMap &&
                  g.id === activeConstellationId &&
                  previewMap[pbId]) ||
                  (appliedForThis && appliedForThis[pbId]) ||
                  (baseMap && baseMap[pbId]) || {
                    x: pb.x,
                    y: pb.y,
                  };

                const selected = g.id === hoveredConstellationId;

                return (
                  <g key={`${g.id}-edge-${idx}`}>
                    {selected && (
                      <line
                        x1={`${p1.x * 100}%`}
                        y1={`${p1.y * 100}%`}
                        x2={`${p2.x * 100}%`}
                        y2={`${p2.y * 100}%`}
                        stroke="#7cf5ff"
                        strokeOpacity="0.22"
                        strokeWidth="4"
                        strokeLinecap="round"
                        pointerEvents="none"
                      />
                    )}
                    <line
                      x1={`${p1.x * 100}%`}
                      y1={`${p1.y * 100}%`}
                      x2={`${p2.x * 100}%`}
                      y2={`${p2.y * 100}%`}
                      stroke="#ffffff"
                      strokeOpacity={selected ? "1" : "0.85"}
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      style={{ cursor: locked ? "pointer" : "default" }}
                      onPointerDown={(e) => {
                        if (locked) startMoveDragConstellation(e, g);
                      }}
                      onMouseEnter={(e) => {
                        if (locked) {
                          setHoveredConstellationId(g.id);
                          showTooltip(e);
                        }
                      }}
                      onMouseMove={showTooltip}
                      onMouseLeave={() => {
                        setHoveredConstellationId(null);
                        if (!isSelected) {
                          setHover({ show: false, x: 0, y: 0 });
                        }
                      }}
                    />
                  </g>
                );
              });
            })}
        </svg>

        {/* 자유 별 (멀티 모드에서 별자리에 포함되지 않은 별) */}
        {filteredStars.map((s) => {
          if (
            multipleMode &&
            constellationStarIdSet &&
            constellationStarIdSet.has(String(s.id))
          ) {
            return null;
          }

          const p = positionOf(s);
          const img = colorImageMap[(s.color || "").toUpperCase()];
          if (!img) return null;
          const selectedForEdit = selectedIds.includes(s.id);
          return (
            <div
              key={`free-${s.id}`}
              style={{
                position: "absolute",
                left: `${p.x * 100}%`,
                top: `${p.y * 100}%`,
                transform: "translate(-50%, -50%)",
                zIndex: 3,
              }}
            >
              <div style={{ position: "relative", width: 22, height: 22 }}>
                {selectedForEdit && (
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      left: "50%",
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                      width: 36,
                      height: 36,
                      borderRadius: "9999px",
                      background:
                        "radial-gradient(circle, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.12) 45%, rgba(255,255,255,0) 70%)",
                      filter: "blur(1.2px)",
                      animation: "twinkle 1.4s ease-in-out infinite",
                      zIndex: 0,
                    }}
                  />
                )}

                {locked &&
                  isSelected &&
                  allowPulseAnim && // ✅ 이 조건 추가
                  !multipleMode &&
                  !selectedForEdit && (
                    <div
                      className="absolute pointer-events-none"
                      style={{
                        left: "50%",
                        top: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 28,
                        height: 28,
                        borderRadius: "9999px",
                        background:
                          "radial-gradient(circle, rgba(124,245,255,0.28) 0%, rgba(124,245,255,0.14) 40%, rgba(124,245,255,0) 75%)",
                        filter: "blur(2px)",
                        zIndex: 0,
                      }}
                    />
                  )}

                <img
                  src={img}
                  alt={s.color}
                  draggable={false}
                  style={{
                    width: 22,
                    height: 22,
                    userSelect: "none",
                    touchAction: "none",
                    cursor: locked ? "pointer" : "grab",
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 1,
                    // 원하면 transition은 유지해도 되고, 아예 빼도 됨
                    // transition: "transform 0.12s ease-out",
                  }}
                  onPointerDown={(e) => onStarPointerDown(e, s)}
                  onPointerMove={(e) => onStarPointerMove(e, s)}
                  onPointerUp={(e) => onStarPointerUp(e, s)}
                  onMouseEnter={showTooltip}
                  onMouseLeave={() => {
                    if (!isSelected) hideTooltip();
                  }}
                />
              </div>
            </div>
          );
        })}

        {/* 멀티 별자리 모드: 각 별자리 안의 별 */}
        {multipleMode &&
          filteredConstellationGroups.map((g) => {
            const appliedForThis = appliedMapRef.current[g.id] || null;
            const baseMap = baseConstShapesRef.current[g.id] || null;
            return (g.stars || []).map((s) => {
              const img = colorImageMap[(s.color || "").toUpperCase()];
              if (!img) return null;

              const id = s.id ?? s.starId;
              const p = (previewMap &&
                g.id === activeConstellationId &&
                previewMap[id]) ||
                (appliedForThis && appliedForThis[id]) ||
                (baseMap && baseMap[id]) || { x: s.x, y: s.y };

              const showPulse =
                allowPulseAnim && // ✅ 추가
                locked &&
                (g.id === activeConstellationId ||
                  g.id === hoveredConstellationId) &&
                isSelected;
              // ✅ 간선과 같은 좌표계 사용: clampToView 대신 clamp01
              const px = clamp01(p.x);
              const py = clamp01(p.y);

              return (
                <div
                  key={`${g.id}-${id}`}
                  style={{
                    position: "absolute",
                    left: `${px * 100}%`,
                    top: `${py * 100}%`,
                    transform: "translate(-50%, -50%)",
                    zIndex: 4,
                  }}
                >
                  <div style={{ position: "relative", width: 22, height: 22 }}>
                    {showPulse && (
                      <div
                        className="absolute pointer-events-none"
                        style={{
                          left: "50%",
                          top: "50%",
                          transform: "translate(-50%, -50%)",
                          width: 28,
                          height: 28,
                          borderRadius: "9999px",
                          background:
                            "radial-gradient(circle, rgba(124,245,255,0.28) 0%, rgba(124,245,255,0.14) 40%, rgba(124,245,255,0) 75%)",
                          filter: "blur(2px)",
                          zIndex: 0,
                        }}
                      />
                    )}

                    <img
                      src={img}
                      alt={s.color}
                      draggable={false}
                      style={{
                        width: 22,
                        height: 22,
                        userSelect: "none",
                        touchAction: "none",
                        cursor: locked ? "pointer" : "grab",
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        transform: "translate(-50%, -50%)",
                        zIndex: 1,
                        // 원하면 transition은 유지해도 되고, 아예 빼도 됨
                        // transition: "transform 0.12s ease-out",
                      }}
                      onPointerDown={(e) => onStarPointerDown(e, s)}
                      onPointerMove={(e) => onStarPointerMove(e, s)}
                      onPointerUp={(e) => onStarPointerUp(e, s)}
                      onMouseEnter={showTooltip}
                      onMouseLeave={() => {
                        if (!isSelected) hideTooltip();
                      }}
                    />
                  </div>
                </div>
              );
            });
          })}

        {showLabelSingle && labelStyleSingle && (
          <div
            className="absolute z-20 bg-white text-[#3A3A3A] text-[11px] px-2 py-1 rounded-xl"
            style={{
              ...labelStyleSingle,
              pointerEvents: "none",
              whiteSpace: "nowrap",
            }}
          >
            <div>{(constellationMeta?.name || "").trim() || "(미지정)"}</div>
            {constellationMeta?.createdAt ? (
              <div className="opacity-80">
                {String(constellationMeta.createdAt).slice(0, 10)}
              </div>
            ) : null}
          </div>
        )}

        {multipleMode && activeConst && activeConstBBox && labelStyleMulti && (
          <div
            className="absolute z-20 bg-white text-[#3A3A3A] text-[11px] px-2 py-1 rounded-xl"
            style={{
              ...labelStyleMulti,
              pointerEvents: "none",
              whiteSpace: "nowrap",
            }}
          >
            <div>{activeConst.name || "(미지정 별자리)"}</div>
            {constellationCreatedAtRef.current[activeConst.id] && (
              <div className="opacity-80">
                {constellationCreatedAtRef.current[activeConst.id]}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ──────────────── 크기 조절 UI (중앙 원 드래그 + 색 변화) ──────────────── */}
      {locked && isSelected && (
        <div
          className="absolute right-6 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col items-center gap-3">
            {/* + 버튼 */}
            <button
              type="button"
              className="text-white text-[28px] leading-none hover:opacity-90"
              onClick={() => {
                const next = Math.min(2.0, +(scaleUI + 0.05).toFixed(2));
                setLastDirection("up");
                setScaleUI(next);
                applyScalePreviewSingle(next);
              }}
            >
              +
            </button>

            {/* ───────── 세로 슬라이더 전체 ───────── */}
            <div className="relative h-[340px] w-[40px] flex flex-col items-center">
              {/* 슬라이더 트랙 */}
              <div className="relative w-[12px] flex-1 rounded-full bg-white/15">
                <div
                  className="absolute left-0 right-0 bg-white/60"
                  style={upFillStyle}
                />

                <div
                  className="absolute left-0 right-0 bg-white/60"
                  style={downFillStyle}
                />

                <div className="absolute inset-0 rounded-full border border-white/30 pointer-events-none" />

                {/* 슬라이더 핸들 */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 w-8 h-8 rounded-full 
               bg-[#f5f5f5] shadow-[0_0_10px_rgba(0,0,0,0.45)]
               cursor-grab active:cursor-grabbing"
                  style={{
                    bottom: `${safeRatio * 100}%`,
                  }}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const startY = e.clientY;
                    const startScale = scaleUI;

                    const onMove = (ev) => {
                      const delta = (startY - ev.clientY) / 250;
                      let next = startScale + delta * 1.5;
                      next = Math.max(0.5, Math.min(2.0, next));

                      if (next > startScale) setLastDirection("up");
                      else if (next < startScale) setLastDirection("down");

                      const fixed = +next.toFixed(3);
                      setScaleUI(fixed);
                      applyScalePreviewSingle(fixed);
                    };

                    const onUp = () => {
                      window.removeEventListener("pointermove", onMove);
                      window.removeEventListener("pointerup", onUp);
                    };

                    window.addEventListener("pointermove", onMove);
                    window.addEventListener("pointerup", onUp);
                  }}
                />
              </div>

              {/* - 버튼 */}
              <button
                type="button"
                className="mt-3 hover:opacity-90"
                onClick={() => {
                  const next = Math.max(0.5, +(scaleUI - 0.05).toFixed(2));
                  setLastDirection("down");
                  setScaleUI(next);
                  applyScalePreviewSingle(next);
                }}
              >
                <div className="w-3 h-[2px] bg-white rounded-full" />
              </button>
            </div>

            {/* 적용 버튼 */}
            <button
              type="button"
              className="mt-2 w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow-lg
         flex items-center justify-center"
              onClick={() => {
                const ok = window.confirm("적용하시겠습니까?");
                if (!ok) return;

                applyScalePreviewSingle(scaleUI, { commit: true });

                const saveKey =
                  multipleMode && activeConstellationId
                    ? activeConstellationId
                    : "single";

                const appliedMap =
                  appliedMapRef.current[saveKey] || previewMap || {};

                if (multipleMode && activeConstellationId) {
                  onConstellationMove?.(activeConstellationId, appliedMap);
                }

                onApply?.(appliedMap, {
                  constellationId: saveKey,
                  scale: scaleUI,
                });

                setPreviewMap(null);
                setPendingApply(false);
              }}
            />
          </div>
        </div>
      )}

      {/* 하단 월/년도 네비게이션 */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10
                   bg-black/30 backdrop-blur px-6 py-2 flex items-center gap-6 select-none"
        aria-label="Month navigation"
      >
        <button
          type="button"
          onClick={onPrev}
          className="text-white text-2xl hover:opacity-80"
        >
          &lt;
        </button>
        <div className="text-white text-[20px] font-julius tracking-wider flex gap-2">
          <span>{year}</span>
          <span>{MONTH_ABBR[firstMonth]}</span>
          <span>/</span>
          <span>{MONTH_ABBR[secondMonth]}</span>
        </div>
        <button
          type="button"
          onClick={onNext}
          className="text-white text-2xl hover:opacity-80"
        >
          &gt;
        </button>
      </div>

      <style>{`
       
        @keyframes twinkle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
