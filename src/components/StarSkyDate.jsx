// src/components/StarSkyDate.jsx
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
const clampToView = (v, pad = 0) => Math.max(pad, Math.min(1 - pad, v));
const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

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
  initialScaleOnLock = 0.5,
  constellationMeta = { name: "", createdAt: "" },
  selectedIds = [],
  onSelectChange,
  onConstellationMove,
}) {
  const containerRef = useRef(null);

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

  // ✅ 캘린더에서 온 별
  const filteredStars = useMemo(() => {
    return stars.filter((s) => inCurrentPair(s.date));
  }, [stars, year, firstMonth, secondMonth]);

  // ✅ 서버에서 온 별자리
  const filteredConstellationGroups = useMemo(() => {
    if (!Array.isArray(constellationGroups) || !constellationGroups.length) {
      return [];
    }
    return constellationGroups.map((g) => ({
      ...g,
      stars: (g.stars || []).map((s) => ({
        ...s,
        x: typeof s.x === "number" ? clamp01(s.x) : 0.5,
        y: typeof s.y === "number" ? clamp01(s.y) : 0.5,
        date: s.date || g.createdAt || new Date().toISOString().slice(0, 10),
      })),
    }));
  }, [constellationGroups]);

  // ⭐️ “서버 원본(x1)” 박제: 다중 모드에서만 사용
  const baseConstShapesRef = useRef({});

  // 상태들
  const [previewMap, setPreviewMap] = useState(null);
  const [isSelected, setIsSelected] = useState(false);
  const groupDragRef = useRef(null);
  const [starDrag, setStarDrag] = useState(null);
  const [hover, setHover] = useState({ show: false, x: 0, y: 0 });

  // 단일 모드 스케일
  const [scaleUI, setScaleUI] = useState(0.5);
  const scaleRef = useRef(1);
  const didInitialScaleRef = useRef(false);
  const committedMapRef = useRef(null);
  const singleScaleOriginRef = useRef(null);

  // 다중 모드
  const [activeConstellationId, setActiveConstellationId] = useState(null);
  const [scaleUIMap, setScaleUIMap] = useState({});
  const committedConstMapRef = useRef({});
  const multiScaleOriginRef = useRef({});

  // 드래그 전 위치
  const originalPositionRef = useRef(null);
  const [pendingApply, setPendingApply] = useState(false);

  // 실제 적용된 것들
  const appliedMapRef = useRef({});
  const [appliedVersion, setAppliedVersion] = useState(0);

  // hover 라벨용
  const [hoveredEdgeSingle, setHoveredEdgeSingle] = useState(false);
  const [hoveredConstellationId, setHoveredConstellationId] = useState(null);

  const multipleMode =
    Array.isArray(filteredConstellationGroups) &&
    filteredConstellationGroups.length > 0;

  // ✅ 다중 모드일 때 처음 들어온 별자리 좌표를 x1로 박제해 둔다
  useEffect(() => {
    if (!multipleMode) return;
    filteredConstellationGroups.forEach((g) => {
      const id = g.id;
      if (!id) return;
      if (!baseConstShapesRef.current[id]) {
        const base = {};
        (g.stars || []).forEach((s) => {
          const realId = s.id ?? s.starId;
          base[realId] = { x: s.x, y: s.y };
        });
        // 최소 크기 한 번만 맞춰주고 x1 기준으로 저장
        baseConstShapesRef.current[id] = ensureMinSize(base, 0.12);
      }
    });
  }, [multipleMode, filteredConstellationGroups]);

  // 단일 모드에서 실제 좌표 얻기
  const positionOf = (s) => {
    const appliedSingle = appliedMapRef.current["single"];
    if (appliedSingle && appliedSingle[s.id]) {
      return appliedSingle[s.id];
    }
    if (previewMap && previewMap[s.id]) {
      return previewMap[s.id];
    }
    return { x: s.x, y: s.y };
  };

  // bbox
  const livePoints = useMemo(
    () => filteredStars.map((s) => positionOf(s)),
    [filteredStars, previewMap, appliedVersion]
  );
  const liveBBox = useMemo(
    () => computeBBoxFromPoints(livePoints),
    [livePoints]
  );

  // 잠금 상태 변화
  useEffect(() => {
    if (multipleMode) {
      // 다중 모드에서는 단일 모드 스케일 초기화 안 함
      didInitialScaleRef.current = false;
      committedMapRef.current = null;
      return;
    }

    if (locked && !didInitialScaleRef.current) {
      didInitialScaleRef.current = true;

      const baseRaw = Object.fromEntries(
        filteredStars.map((s) => [s.id, { x: s.x, y: s.y }])
      );
      const base = ensureMinSize(baseRaw, 0.12);

      committedMapRef.current = base;
      appliedMapRef.current["single"] = base;
      scaleRef.current = 1;
      singleScaleOriginRef.current = null;
      setScaleUI(initialScaleOnLock);
      applyScalePreviewSingle(initialScaleOnLock, {
        commit: true,
        forceFromScale: 1,
      });
      setIsSelected(false);
      setAppliedVersion((v) => v + 1);
    }

    if (!locked) {
      didInitialScaleRef.current = false;
      committedMapRef.current = null;
      setPreviewMap(null);
      setIsSelected(false);
      setScaleUI(0.5);
      scaleRef.current = 1;
      appliedMapRef.current = {};
      singleScaleOriginRef.current = null;
      multiScaleOriginRef.current = {};
      setPendingApply(false);
      setHoveredEdgeSingle(false);
      setHoveredConstellationId(null);
      setAppliedVersion((v) => v + 1);
    }
  }, [
    locked,
    filteredStars,
    initialScaleOnLock,
    filteredConstellationGroups,
    multipleMode,
  ]);

  const toRel = (clientX, clientY) => {
    const r = containerRef.current.getBoundingClientRect();
    return {
      x: clamp01((clientX - r.left) / r.width),
      y: clamp01((clientY - r.top) / r.height),
    };
  };

  // ───────── 단일 모드 드래그 시작 ─────────
  const startMoveDragSingle = (e) => {
    if (!locked || !liveBBox) return;
    e.preventDefault();
    e.stopPropagation();
    try {
      e.currentTarget?.setPointerCapture?.(e.pointerId);
    } catch {}
    const startRel = toRel(e.clientX, e.clientY);

    const baseMap =
      previewMap ||
      appliedMapRef.current["single"] ||
      committedMapRef.current ||
      Object.fromEntries(filteredStars.map((s) => [s.id, { x: s.x, y: s.y }]));

    groupDragRef.current = {
      pointerId: e.pointerId,
      startRel,
      bbox0: computeBBoxFromPoints(Object.values(baseMap)),
      originMap: baseMap,
      mode: "single",
    };

    setIsSelected(true);
    setPendingApply(true);
    originalPositionRef.current = deepClone(baseMap);
    // 이후 스케일 기준도 이걸로
    singleScaleOriginRef.current = deepClone(baseMap);
  };

  // ───────── 다중 모드 드래그 시작 ─────────
  const startMoveDragConstellation = (e, constellation) => {
    if (!locked) return;
    e.preventDefault();
    e.stopPropagation();
    try {
      e.currentTarget?.setPointerCapture?.(e.pointerId);
    } catch {}
    const startRel = toRel(e.clientX, e.clientY);
    const constId = constellation.id;

    // 🔥 지금 보이는 게 우선
    const previewForThis =
      previewMap && constId === activeConstellationId ? previewMap : null;
    const appliedForThis = appliedMapRef.current[constId];

    let originMap = {};

    if (previewForThis) {
      Object.entries(previewForThis).forEach(([id, p]) => {
        originMap[id] = { x: p.x, y: p.y };
      });
    } else if (appliedForThis) {
      Object.entries(appliedForThis).forEach(([id, p]) => {
        originMap[id] = { x: p.x, y: p.y };
      });
    } else if (committedConstMapRef.current[constId]) {
      originMap = deepClone(committedConstMapRef.current[constId]);
    } else {
      // 서버 원본
      (constellation.stars || []).forEach((s) => {
        const realId = s.id || s.starId;
        originMap[realId] = {
          x: clampToView(s.x),
          y: clampToView(s.y),
        };
      });
      originMap = ensureMinSize(originMap, 0.12);
    }

    // 이걸 드래그 기준 + 커밋 기준으로
    committedConstMapRef.current[constId] = deepClone(originMap);

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
    setIsSelected(true);
    setPendingApply(true);
    originalPositionRef.current = deepClone(originMap);
    // 스케일 기준도 지금 모양으로
    multiScaleOriginRef.current[constId] = deepClone(originMap);
  };

  // ───────── 그룹 드래그 중 ─────────
  const onGroupPointerMove = (e) => {
    const drag = groupDragRef.current;
    if (!drag) return;
    e.preventDefault();

    const curRel = toRel(e.clientX, e.clientY);
    const { minX, minY, maxX, maxY } = drag.bbox0;
    const w0 = Math.max(0.001, maxX - minX);
    const h0 = Math.max(0.001, maxY - minY);

    const dxRel = curRel.x - drag.startRel.x;
    const dyRel = curRel.y - drag.startRel.y;

    const nMinX = clamp01(minX + dxRel);
    const nMinY = clamp01(minY + dyRel);
    const nMaxX = clamp01(maxX + dxRel);
    const nMaxY = clamp01(maxY + dyRel);

    const nw = nMaxX - nMinX;
    const nh = nMaxY - nMinY;

    const map = {};
    Object.entries(drag.originMap).forEach(([id, b]) => {
      const tx = (b.x - minX) / w0;
      const ty = (b.y - minY) / h0;
      map[id] = {
        x: clampToView(nMinX + tx * nw),
        y: clampToView(nMinY + ty * nh),
      };
    });

    setPreviewMap(map);
    onTransform?.(map);
  };

  // ───────── 그룹 드래그 끝 ─────────
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
        singleScaleOriginRef.current = deepClone(previewMap);
      } else if (appliedMapRef.current["single"]) {
        singleScaleOriginRef.current = deepClone(
          appliedMapRef.current["single"]
        );
      }
    } else if (drag.mode === "multi") {
      const constId = drag.constellationId;
      if (previewMap) {
        multiScaleOriginRef.current[constId] = deepClone(previewMap);
        committedConstMapRef.current[constId] = deepClone(previewMap);
      } else if (appliedMapRef.current[constId]) {
        multiScaleOriginRef.current[constId] = deepClone(
          appliedMapRef.current[constId]
        );
        committedConstMapRef.current[constId] = deepClone(
          appliedMapRef.current[constId]
        );
      }
    }
  };

  // ───────── 배경 클릭 ─────────
  const onBackgroundPointerDown = (e) => {
    if (!locked) return;
    e.preventDefault();
    e.stopPropagation();
    setIsSelected(false);
    setActiveConstellationId(null);
    setHover({ show: false, x: 0, y: 0 });
    setHoveredEdgeSingle(false);
    setHoveredConstellationId(null);

    if (pendingApply) {
      if (originalPositionRef.current) {
        setPreviewMap(null);
        onTransformEnd?.(originalPositionRef.current);
      }
      setPendingApply(false);
    }
  };

  // ───────── 개별 별 드래그 시작 ─────────
  const onStarPointerDown = (e, star) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      e.currentTarget.setPointerCapture?.(e.pointerId);
    } catch {}
    const cur = previewMap?.[star.id] ?? { x: star.x, y: star.y };
    setStarDrag({
      id: star.id,
      startXpx: e.clientX,
      startYpx: e.clientY,
      moved: false,
      originPos: { ...cur },
    });
  };

  // ───────── 개별 별 드래그 중 ─────────
  const onStarPointerMove = (e, star) => {
    if (!starDrag || starDrag.id !== star.id) return;
    e.preventDefault();

    const r = containerRef.current.getBoundingClientRect();
    const dxPx = e.clientX - starDrag.startXpx;
    const dyPx = e.clientY - starDrag.startYpx;

    const moved =
      starDrag.moved || Math.hypot(dxPx, dyPx) >= DRAG_SELECT_THRESHOLD_PX;

    const nx = clampToView(starDrag.originPos.x + dxPx / r.width);
    const ny = clampToView(starDrag.originPos.y + dyPx / r.height);

    const base =
      previewMap ??
      Object.fromEntries(filteredStars.map((s) => [s.id, { x: s.x, y: s.y }]));
    const next = { ...base, [star.id]: { x: nx, y: ny } };

    setStarDrag((s) => (s ? { ...s, moved } : s));
    setPreviewMap(next);

    // ✅ 캘린더별은 바로 저장
    const isCalendarStar = filteredStars.some((fs) => fs.id === star.id);
    if (isCalendarStar) {
      onMove?.(star.id, nx, ny);
    }
  };

  // ───────── 개별 별 드래그 끝 ─────────
  const onStarPointerUp = (e, star) => {
    if (!starDrag || starDrag.id !== star.id) return;
    e.preventDefault();
    try {
      e.currentTarget.releasePointerCapture?.(starDrag.pointerId);
    } catch {}

    if (!starDrag.moved) {
      // 클릭 → 선택 토글
      const isCalendarStar = filteredStars.some((fs) => fs.id === star.id);
      if (isCalendarStar && typeof onSelectChange === "function") {
        if (selectedIds.includes(star.id)) {
          onSelectChange(selectedIds.filter((x) => x !== star.id));
        } else {
          onSelectChange([...selectedIds, star.id]);
        }
      }
    } else {
      // 실제 이동 → 적용맵에도 반영
      if (previewMap) {
        appliedMapRef.current["single"] = deepClone(previewMap);
        committedMapRef.current = deepClone(previewMap);
        singleScaleOriginRef.current = deepClone(previewMap);
        setAppliedVersion((v) => v + 1);
      }
    }

    setStarDrag(null);
  };

  // ───────── 단일 모드 스케일 프리뷰 ─────────
  const applyScalePreviewSingle = (
    newScale,
    { commit = false, forceFromScale } = {}
  ) => {
    const sAbs = Math.max(0.2, Math.min(1.0, newScale));

    let origin = singleScaleOriginRef.current;

    if (!origin) {
      const rawBase =
        previewMap ||
        appliedMapRef.current["single"] ||
        committedMapRef.current ||
        Object.fromEntries(
          filteredStars.map((s) => [s.id, { x: s.x, y: s.y }])
        );

      origin = ensureMinSize(rawBase, 0.12);
      singleScaleOriginRef.current = origin;
    }

    const pts = Object.values(origin);
    const bbox = computeBBoxFromPoints(pts);
    if (!bbox) return;
    const { cx, cy } = bbox;

    const scaled = {};
    Object.entries(origin).forEach(([id, p]) => {
      const dx = p.x - cx;
      const dy = p.y - cy;
      scaled[id] = {
        x: cx + dx * sAbs,
        y: cy + dy * sAbs,
      };
    });

    const fitted = fitMapIntoView(scaled, 0);

    setPreviewMap(fitted);
    onTransform?.(fitted);
    setPendingApply(true);

    if (commit) {
      committedMapRef.current = fitted;
      appliedMapRef.current["single"] = fitted;
      scaleRef.current = sAbs;
      singleScaleOriginRef.current = deepClone(fitted);
      onTransformEnd?.(fitted);
      setPendingApply(false);
      setAppliedVersion((v) => v + 1);
    }
  };

  const showTooltip = (e) => {
    const r = containerRef.current.getBoundingClientRect();
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
    const pts = (activeConst.stars || []).map((s) => {
      const id = s.id ?? s.starId;
      if (
        previewMap &&
        activeConst.id === activeConstellationId &&
        previewMap[id]
      )
        return previewMap[id];
      if (applied && applied[id]) return applied[id];
      return { x: s.x, y: s.y };
    });
    return computeBBoxFromPoints(pts);
  })();

  const showLabelSingle =
    !multipleMode && locked && hoveredEdgeSingle && liveBBox;

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
        {/* 단일 모드 선 */}
        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 2 }}>
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

          {/* 다중 모드 선 */}
          {multipleMode &&
            filteredConstellationGroups.map((g) => {
              const appliedForThis = appliedMapRef.current[g.id] || null;
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
                  (appliedForThis && appliedForThis[paId]) || {
                    x: pa.x,
                    y: pa.y,
                  };
                const p2 = (previewMap &&
                  g.id === activeConstellationId &&
                  previewMap[pbId]) ||
                  (appliedForThis && appliedForThis[pbId]) || {
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

        {/* 달력 별 */}
        {filteredStars.map((s) => {
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
                      "radial-gradient(circle, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.15) 45%, rgba(255,255,255,0) 75%)",
                    filter: "blur(2px)",
                    animation: "twinkle 1.4s ease-in-out infinite",
                    zIndex: 0,
                  }}
                />
              )}

              {locked && isSelected && !multipleMode && !selectedForEdit && (
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
                    animation: "pulseSoft 2.2s ease-in-out infinite",
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
                  position: "relative",
                  zIndex: 1,
                  transition: "transform 0.12s ease-out",
                  transform: selectedForEdit
                    ? "translate(-50%, -50%) scale(1.08)"
                    : "translate(-50%, -50%)",
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
          );
        })}

        {/* 다중 모드 별 */}
        {multipleMode &&
          filteredConstellationGroups.map((g) => {
            const appliedForThis = appliedMapRef.current[g.id] || null;
            return (g.stars || []).map((s) => {
              const img = colorImageMap[(s.color || "").toUpperCase()];
              if (!img) return null;

              const id = s.id ?? s.starId;
              const p = (previewMap &&
                g.id === activeConstellationId &&
                previewMap[id]) ||
                (appliedForThis && appliedForThis[id]) || { x: s.x, y: s.y };

              return (
                <div
                  key={`${g.id}-${id}`}
                  style={{
                    position: "absolute",
                    left: `${clampToView(p.x) * 100}%`,
                    top: `${clampToView(p.y) * 100}%`,
                    transform: "translate(-50%, -50%)",
                    zIndex: 4,
                  }}
                >
                  {locked &&
                    (g.id === activeConstellationId ||
                      g.id === hoveredConstellationId) &&
                    isSelected && (
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
                          animation: "pulseSoft 2.2s ease-in-out infinite",
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
                      position: "relative",
                      zIndex: 1,
                    }}
                    onPointerDown={(e) => startMoveDragConstellation(e, g)}
                    onMouseEnter={showTooltip}
                    onMouseLeave={() => {
                      if (!isSelected) hideTooltip();
                    }}
                  />
                </div>
              );
            });
          })}

        {/* 단일 라벨 */}
        {showLabelSingle && (
          <div
            className="absolute z-20 bg-black/75 text-white text-[11px] px-2 py-1 rounded"
            style={{
              left: liveBBox ? `${liveBBox.cx * 100}%` : "0%",
              top: liveBBox ? `${liveBBox.minY * 100}%` : "0%",
              transform: "translate(-50%, -120%)",
              pointerEvents: "none",
              whiteSpace: "nowrap",
            }}
          >
            <div>{(constellationMeta?.name || "").trim() || "(미지정)"}</div>
            {constellationMeta?.createdAt ? (
              <div className="opacity-80">{constellationMeta.createdAt}</div>
            ) : null}
          </div>
        )}

        {/* 다중 라벨 */}
        {multipleMode && activeConst && activeConstBBox && (
          <div
            className="absolute z-20 bg-black/75 text-white text-[11px] px-2 py-1 rounded"
            style={{
              left: `${activeConstBBox.cx * 100}%`,
              top: `${activeConstBBox.minY * 100}%`,
              transform: "translate(-50%, -120%)",
              pointerEvents: "none",
              whiteSpace: "nowrap",
            }}
          >
            <div>{activeConst.name || "(미지정 별자리)"}</div>
            {activeConst.createdAt ? (
              <div className="opacity-80">{activeConst.createdAt}</div>
            ) : null}
          </div>
        )}
      </div>

      {/* 단일 모드 패널 */}
      {!multipleMode && locked && isSelected && (
        <div
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/35 backdrop-blur px-4 py-3 rounded-xl flex flex-col gap-3 min-w-[220px]"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="text-white/85 text-sm">크기 조절 (0.2x ~ 1.0x)</div>
          <input
            type="range"
            min={0.2}
            max={1.0}
            step={0.02}
            value={scaleUI}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              setScaleUI(v);
              applyScalePreviewSingle(v);
            }}
          />
          <div className="flex items-center justify-between text-white/70 text-xs">
            <span>0.2x</span>
            <span>0.5x</span>
            <span>1.0x</span>
          </div>
          <button
            className="px-3 py-1.5 rounded bg-white/75 hover:bg-white text-black text-sm"
            onClick={() => {
              if (!previewMap) {
                if (originalPositionRef.current) {
                  setPreviewMap(null);
                  onTransformEnd?.(originalPositionRef.current);
                  singleScaleOriginRef.current = originalPositionRef.current;
                }
                setPendingApply(false);
                return;
              }
              const ok = window.confirm("이 위치로 적용하시겠습니까?");
              if (!ok) {
                if (originalPositionRef.current) {
                  setPreviewMap(null);
                  onTransformEnd?.(originalPositionRef.current);
                  singleScaleOriginRef.current = originalPositionRef.current;
                }
                setPendingApply(false);
                return;
              }
              applyScalePreviewSingle(scaleUI, { commit: true });
              onApply?.(previewMap);
              setPreviewMap(null);
              setPendingApply(false);
              setIsSelected(true);
            }}
          >
            적용
          </button>
        </div>
      )}

      {/* 다중 모드 패널 */}
      {multipleMode && locked && activeConstellationId && isSelected && (
        <div
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/35 backdrop-blur px-4 py-3 rounded-xl flex flex-col gap-3 min-w-[220px]"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="text-white/85 text-sm">
            이 별자리 크기 조절 (0.2x ~ 1.0x)
          </div>
          <input
            type="range"
            min={0.2}
            max={1.0}
            step={0.05}
            value={
              scaleUIMap[activeConstellationId] ??
              appliedMapRef.current[activeConstellationId + "__scale"] ??
              1
            }
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              setScaleUIMap((prev) => ({
                ...prev,
                [activeConstellationId]: v,
              }));

              const selected = filteredConstellationGroups.find(
                (g) => g.id === activeConstellationId
              );
              if (!selected) return;

              // 1) 원본(처음 서버에서 온) 모양 - x1
              const base = baseConstShapesRef.current[activeConstellationId];
              if (!base) return;

              // 2) 지금 커밋돼있는 모양(=드래그로 옮긴 상태)
              const committed =
                committedConstMapRef.current[activeConstellationId] ||
                appliedMapRef.current[activeConstellationId] ||
                base;

              const baseBox = computeBBoxFromPoints(Object.values(base));
              const committedBox = computeBBoxFromPoints(
                Object.values(committed)
              );

              // 원본과 현재모양의 위치 차이 = 번역량
              const tx =
                committedBox && baseBox ? committedBox.cx - baseBox.cx : 0;
              const ty =
                committedBox && baseBox ? committedBox.cy - baseBox.cy : 0;

              // 3) 원본 기준으로 스케일 + 번역 덧셈
              const scaled = {};
              Object.entries(base).forEach(([id, p]) => {
                const dx = p.x - baseBox.cx;
                const dy = p.y - baseBox.cy;
                scaled[id] = {
                  x: baseBox.cx + dx * v + tx,
                  y: baseBox.cy + dy * v + ty,
                };
              });

              // ⭐ 드래그 위치가 밀리지 않도록 fitMapIntoView 하지 않는다
              setPreviewMap(scaled);
              onTransform?.(scaled);
              setPendingApply(true);
            }}
          />
          <div className="flex items-center justify-between text-white/70 text-xs">
            <span>0.2x</span>
            <span>1.0x</span>
          </div>
          <button
            className="px-3 py-1.5 rounded bg-white/75 hover:bg-white text-black text-sm"
            onClick={() => {
              const cur = previewMap;
              const ok = window.confirm("이 위치로 적용하시겠습니까?");
              if (!ok) {
                if (originalPositionRef.current) {
                  setPreviewMap(null);
                  onTransformEnd?.(originalPositionRef.current);
                }
                setPendingApply(false);
                return;
              }

              const constId = activeConstellationId;

              if (cur) {
                appliedMapRef.current[constId] = cur;
                const lastScale =
                  scaleUIMap[constId] ??
                  appliedMapRef.current[constId + "__scale"] ??
                  1;
                appliedMapRef.current[constId + "__scale"] = lastScale;

                committedConstMapRef.current[constId] = deepClone(cur);
                onTransformEnd?.(cur);
                onApply?.(cur);
                if (onConstellationMove) {
                  onConstellationMove(constId, cur);
                }
                setAppliedVersion((v) => v + 1);
                setPreviewMap(null);
                setPendingApply(false);
                originalPositionRef.current = deepClone(cur);
                setIsSelected(true);
              } else if (originalPositionRef.current) {
                appliedMapRef.current[constId] = originalPositionRef.current;
                const lastScale =
                  scaleUIMap[constId] ??
                  appliedMapRef.current[constId + "__scale"] ??
                  1;
                appliedMapRef.current[constId + "__scale"] = lastScale;

                committedConstMapRef.current[constId] = deepClone(
                  originalPositionRef.current
                );
                onTransformEnd?.(originalPositionRef.current);
                onApply?.(originalPositionRef.current);
                if (onConstellationMove) {
                  onConstellationMove(constId, originalPositionRef.current);
                }
                setAppliedVersion((v) => v + 1);
                setPreviewMap(null);
                setPendingApply(false);
                setIsSelected(true);
              }
            }}
          >
            적용
          </button>
        </div>
      )}

      {/* Month nav */}
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
        @keyframes pulseSoft {
          0% { transform: translate(-50%, -50%) scale(0.98); opacity: 0.6; }
          50% { transform: translate(-50%, -50%) scale(1.02); opacity: 0.9; }
          100% { transform: translate(-50%, -50%) scale(0.98); opacity: 0.6; }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
