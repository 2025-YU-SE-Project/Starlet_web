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

  const filteredStars = useMemo(() => {
    return stars.filter((s) => inCurrentPair(s.date));
  }, [stars, year, firstMonth, secondMonth]);

  const filteredConstellationGroups = useMemo(() => {
    if (!Array.isArray(constellationGroups) || !constellationGroups.length) {
      return [];
    }
    return constellationGroups
      .map((g) => {
        const onlyThisPairStars = (g.stars || []).filter((s) =>
          inCurrentPair(s.date)
        );
        if (onlyThisPairStars.length === 0) return null;
        return {
          ...g,
          stars: onlyThisPairStars,
        };
      })
      .filter(Boolean);
  }, [constellationGroups, year, firstMonth, secondMonth]);

  const [previewMap, setPreviewMap] = useState(null);
  const [isSelected, setIsSelected] = useState(false);
  const groupDragRef = useRef(null);
  const [starDrag, setStarDrag] = useState(null);
  const [hover, setHover] = useState({ show: false, x: 0, y: 0 });

  const [scaleUI, setScaleUI] = useState(0.5);
  const scaleRef = useRef(1);
  const didInitialScaleRef = useRef(false);
  const committedMapRef = useRef(null);

  const [activeConstellationId, setActiveConstellationId] = useState(null);
  const [scaleUIMap, setScaleUIMap] = useState({});

  const positionOf = (s) => previewMap?.[s.id] ?? { x: s.x, y: s.y };

  const livePoints = useMemo(
    () => filteredStars.map((s) => positionOf(s)),
    [filteredStars, previewMap]
  );
  const liveBBox = useMemo(
    () => computeBBoxFromPoints(livePoints),
    [livePoints]
  );

  useEffect(() => {
    const multipleMode =
      Array.isArray(filteredConstellationGroups) &&
      filteredConstellationGroups.length > 0;

    if (multipleMode) {
      didInitialScaleRef.current = false;
      committedMapRef.current = null;
      return;
    }

    if (locked && !didInitialScaleRef.current) {
      didInitialScaleRef.current = true;
      committedMapRef.current = Object.fromEntries(
        filteredStars.map((s) => [s.id, { x: s.x, y: s.y }])
      );
      scaleRef.current = 1;
      setScaleUI(initialScaleOnLock);
      applyScalePreviewSingle(initialScaleOnLock, {
        commit: true,
        forceFromScale: 1,
      });
      setIsSelected(false);
    }
    if (!locked) {
      didInitialScaleRef.current = false;
      committedMapRef.current = null;
      setPreviewMap(null);
      setIsSelected(false);
      setScaleUI(0.5);
      scaleRef.current = 1;
    }
  }, [locked, filteredStars, initialScaleOnLock, filteredConstellationGroups]);

  const toRel = (clientX, clientY) => {
    const r = containerRef.current.getBoundingClientRect();
    return {
      x: clamp01((clientX - r.left) / r.width),
      y: clamp01((clientY - r.top) / r.height),
    };
  };

  const startMoveDragSingle = (e) => {
    if (!locked || !liveBBox) return;
    e.preventDefault();
    e.stopPropagation();
    try {
      e.currentTarget?.setPointerCapture?.(e.pointerId);
    } catch {}
    const startRel = toRel(e.clientX, e.clientY);
    const baseMap =
      committedMapRef.current ??
      Object.fromEntries(filteredStars.map((s) => [s.id, { x: s.x, y: s.y }]));

    groupDragRef.current = {
      pointerId: e.pointerId,
      startRel,
      bbox0: computeBBoxFromPoints(Object.values(baseMap)),
      originMap: baseMap,
      mode: "single",
    };
    setIsSelected(true);
  };

  const startMoveDragConstellation = (e, constellation) => {
    if (!locked) return;
    e.preventDefault();
    e.stopPropagation();
    try {
      e.currentTarget?.setPointerCapture?.(e.pointerId);
    } catch {}
    const startRel = toRel(e.clientX, e.clientY);

    const originMap = {};
    (constellation.stars || []).forEach((s) => {
      originMap[s.id || s.starId] = { x: s.x, y: s.y };
    });

    const bbox0 = computeBBoxFromPoints(Object.values(originMap));

    groupDragRef.current = {
      pointerId: e.pointerId,
      startRel,
      bbox0,
      originMap,
      mode: "multi",
      constellationId: constellation.id,
    };
    setActiveConstellationId(constellation.id);
  };

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
      map[id] = { x: clamp01(nMinX + tx * nw), y: clamp01(nMinY + ty * nh) };
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
    if (previewMap) {
      onTransformEnd?.(previewMap);
      committedMapRef.current = { ...previewMap };
    }
    groupDragRef.current = null;
  };

  const onBackgroundPointerDown = (e) => {
    if (!locked) return;
    e.preventDefault();
    e.stopPropagation();
    setIsSelected(false);
    setActiveConstellationId(null);
    setHover({ show: false, x: 0, y: 0 });
  };

  const onStarPointerDown = (e, star) => {
    if (locked) {
      if (
        !Array.isArray(filteredConstellationGroups) ||
        filteredConstellationGroups.length === 0
      ) {
        startMoveDragSingle(e);
      }
      return;
    }
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

  const onStarPointerMove = (e, star) => {
    if (!starDrag || starDrag.id !== star.id) return;
    e.preventDefault();

    const r = containerRef.current.getBoundingClientRect();
    const dxPx = e.clientX - starDrag.startXpx;
    const dyPx = e.clientY - starDrag.startYpx;

    const moved =
      starDrag.moved || Math.hypot(dxPx, dyPx) >= DRAG_SELECT_THRESHOLD_PX;

    const nx = clamp01(starDrag.originPos.x + dxPx / r.width);
    const ny = clamp01(starDrag.originPos.y + dyPx / r.height);

    const base =
      previewMap ??
      Object.fromEntries(filteredStars.map((s) => [s.id, { x: s.x, y: s.y }]));
    const next = { ...base, [star.id]: { x: nx, y: ny } };

    setStarDrag((s) => (s ? { ...s, moved } : s));
    setPreviewMap(next);
    onMove?.(star.id, nx, ny);
  };

  const onStarPointerUp = (e, star) => {
    if (!starDrag || starDrag.id !== star.id) return;
    e.preventDefault();
    try {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    } catch {}
    if (!starDrag.moved) {
      if (!locked) {
        if (!onSelectChange) return;
        if (selectedIds.includes(star.id))
          onSelectChange(selectedIds.filter((x) => x !== star.id));
        else onSelectChange([...selectedIds, star.id]);
      }
    }
    setStarDrag(null);
  };

  const applyScalePreviewSingle = (
    newScale,
    { commit = false, forceFromScale } = {}
  ) => {
    const baseMap =
      committedMapRef.current ??
      Object.fromEntries(filteredStars.map((s) => [s.id, { x: s.x, y: s.y }]));
    const basePts = Object.values(baseMap);
    const baseBBox = computeBBoxFromPoints(basePts);
    if (!baseBBox) return;

    const sAbs = Math.max(0.2, Math.min(0.5, newScale));
    const currentAbs =
      typeof forceFromScale === "number" ? forceFromScale : scaleRef.current;
    const factor = sAbs / currentAbs;

    const { cx, cy, w, h } = baseBBox;
    let nMinX = cx - (w * factor) / 2;
    let nMinY = cy - (h * factor) / 2;
    let nMaxX = cx + (w * factor) / 2;
    let nMaxY = cy + (h * factor) / 2;

    if (nMinX < 0) {
      nMaxX -= nMinX;
      nMinX = 0;
    }
    if (nMinY < 0) {
      nMaxY -= nMinY;
      nMinY = 0;
    }
    if (nMaxX > 1) {
      const over = nMaxX - 1;
      nMinX -= over;
      nMaxX = 1;
    }
    if (nMaxY > 1) {
      const over = nMaxY - 1;
      nMinY -= over;
      nMaxY = 1;
    }

    const nw = Math.max(0.001, nMaxX - nMinX);
    const nh = Math.max(0.001, nMaxY - nMinY);

    const map = {};
    Object.entries(baseMap).forEach(([id, p]) => {
      const tx = (p.x - baseBBox.minX) / baseBBox.w;
      const ty = (p.y - baseBBox.minY) / baseBBox.h;
      map[id] = { x: clamp01(nMinX + tx * nw), y: clamp01(nMinY + ty * nh) };
    });

    setPreviewMap(map);
    onTransform?.(map);

    if (commit) {
      committedMapRef.current = map;
      scaleRef.current = sAbs;
      onTransformEnd?.(map);
    }
  };

  const showTooltip = (e) => {
    const r = containerRef.current.getBoundingClientRect();
    setHover({ show: true, x: e.clientX - r.left, y: e.clientY - r.top });
  };
  const hideTooltip = () => setHover({ show: false, x: 0, y: 0 });

  const multipleMode =
    Array.isArray(filteredConstellationGroups) &&
    filteredConstellationGroups.length > 0;

  const activeConst = multipleMode
    ? filteredConstellationGroups.find((g) => g.id === activeConstellationId)
    : null;

  const showLabelSingle =
    !multipleMode &&
    locked &&
    (hover.show || isSelected || !!groupDragRef.current) &&
    liveBBox;

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
                    onMouseEnter={showTooltip}
                    onMouseLeave={hideTooltip}
                  />
                </g>
              );
            })}

          {multipleMode &&
            filteredConstellationGroups.map((g) => {
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
                const p1 = { x: pa.x, y: pa.y };
                const p2 = { x: pb.x, y: pb.y };
                const selected = activeConstellationId === g.id;
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
                      onMouseEnter={showTooltip}
                      onMouseLeave={hideTooltip}
                    />
                  </g>
                );
              });
            })}
        </svg>

        {!multipleMode &&
          filteredStars.map((s) => {
            const p = positionOf(s);
            const img = colorImageMap[s.color];
            if (!img) return null;
            const selectedForEdit = selectedIds.includes(s.id);
            return (
              <div
                key={s.id}
                style={{
                  position: "absolute",
                  left: `${p.x * 100}%`,
                  top: `${p.y * 100}%`,
                  transform: "translate(-50%, -50%)",
                  zIndex: 3,
                }}
              >
                {locked && isSelected && (
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

                {selectedForEdit && !locked && (
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      left: "50%",
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                      width: 30,
                      height: 30,
                      borderRadius: "9999px",
                      background:
                        "radial-gradient(circle, rgba(255,255,200,0.35) 0%, rgba(255,255,200,0.18) 35%, rgba(255,255,200,0) 70%)",
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
                  onPointerDown={(e) => onStarPointerDown(e, s)}
                  onPointerMove={(e) => onStarPointerMove(e, s)}
                  onPointerUp={(e) => onStarPointerUp(e, s)}
                  onMouseEnter={showTooltip}
                  onMouseLeave={hideTooltip}
                />
              </div>
            );
          })}

        {multipleMode &&
          filteredConstellationGroups.map((g) =>
            (g.stars || []).map((s) => {
              const img = colorImageMap[s.color];
              if (!img) return null;

              return (
                <div
                  key={`${g.id}-${s.id ?? s.starId}`}
                  style={{
                    position: "absolute",
                    left: `${s.x * 100}%`,
                    top: `${s.y * 100}%`,
                    transform: "translate(-50%, -50%)",
                    zIndex: 3,
                  }}
                >
                  {locked && activeConstellationId === g.id && (
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
                    onMouseLeave={hideTooltip}
                  />
                </div>
              );
            })
          )}

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

        {multipleMode && activeConst && (
          <div
            className="absolute z-20 bg-black/75 text-white text-[11px] px-2 py-1 rounded"
            style={{
              left: "50%",
              top: "10%",
              transform: "translate(-50%, -50%)",
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

      {!multipleMode && locked && isSelected && (
        <div
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/35 backdrop-blur px-4 py-3 rounded-xl flex flex-col gap-3 min-w-[220px]"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="text-white/85 text-sm">크기 조절 (20% ~ 50%)</div>
          <input
            type="range"
            min={0.2}
            max={0.5}
            step={0.01}
            value={scaleUI}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              setScaleUI(v);
              applyScalePreviewSingle(v);
            }}
          />
          <div className="flex items-center justify-between text-white/70 text-xs">
            <span>20%</span>
            <span>50%</span>
            <span>50%</span>
          </div>
          <button
            className="px-3 py-1.5 rounded bg-white/75 hover:bg-white text-black text-sm"
            onClick={() => {
              applyScalePreviewSingle(scaleUI, { commit: true });
              const map =
                committedMapRef.current ||
                Object.fromEntries(
                  filteredStars.map((s) => [s.id, { x: s.x, y: s.y }])
                );
              onApply?.(map);
            }}
          >
            적용
          </button>
        </div>
      )}

      {multipleMode && locked && activeConstellationId && (
        <div
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/35 backdrop-blur px-4 py-3 rounded-xl flex flex-col gap-3 min-w-[220px]"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="text-white/85 text-sm">
            이 별자리 크기 조절 (0.2x ~ 2.0x)
          </div>
          <input
            type="range"
            min={0.2}
            max={2.0}
            step={0.05}
            value={scaleUIMap[activeConstellationId] || 1}
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
              const bbox = computeBBoxFromPoints(
                (selected.stars || []).map((s) => ({ x: s.x, y: s.y }))
              );
              if (!bbox) return;
              const { cx, cy } = bbox;
              const map = {};
              (selected.stars || []).forEach((s) => {
                const dx = s.x - cx;
                const dy = s.y - cy;
                const nx = clamp01(cx + dx * v);
                const ny = clamp01(cy + dy * v);
                map[s.id ?? s.starId] = { x: nx, y: ny };
              });
              setPreviewMap(map);
              onTransform?.(map);
            }}
          />
          <div className="flex items-center justify-between text-white/70 text-xs">
            <span>0.2x</span>
            <span>1.0x</span>
            <span>2.0x</span>
          </div>
          <button
            className="px-3 py-1.5 rounded bg-white/75 hover:bg-white text-black text-sm"
            onClick={() => {
              const map = previewMap;
              if (!map) return;
              onTransformEnd?.(map);
              onApply?.(map);
            }}
          >
            적용
          </button>
        </div>
      )}

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
      `}</style>
    </div>
  );
}
