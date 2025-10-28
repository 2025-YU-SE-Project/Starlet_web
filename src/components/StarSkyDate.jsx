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
  colorImageMap = {},
  onMove, // !locked: 개별 별 드래그 시 (id, x, y)
  locked = false, // true: 별자리(그룹) 이동/스케일
  onTransform,
  onTransformEnd,
  onApply, // 적용 버튼에서 현재 좌표 전달(map)
  initialScaleOnLock = 0.5,
  constellationMeta = { name: "", createdAt: "" },

  // 편집 모드 선택 표시용
  selectedIds = [],
  onSelectChange,
}) {
  const containerRef = useRef(null);

  // 미리보기 좌표(드래그/스케일 중)
  const [previewMap, setPreviewMap] = useState(null);
  const [isSelected, setIsSelected] = useState(false);

  // locked=true: 그룹 드래그 상태
  const groupDragRef = useRef(null); // {startRel, bbox0, originMap, pointerId}

  // !locked: 개별 별 드래그 상태
  const [starDrag, setStarDrag] = useState(null); // { id, startXpx, startYpx, moved, originPos }

  // Hover (별/간선 위에서만)
  const [hover, setHover] = useState({ show: false, x: 0, y: 0 });

  // 스케일 상태 (절대 0.2 ~ 0.5)
  const [scaleUI, setScaleUI] = useState(0.5);
  const scaleRef = useRef(1);
  const didInitialScaleRef = useRef(false);

  // 마지막 커밋된 좌표 맵 (locked 전용)
  const committedMapRef = useRef(null);

  // 렌더 좌표
  const positionOf = (s) => previewMap?.[s.id] ?? { x: s.x, y: s.y };
  const livePoints = useMemo(
    () => stars.map((s) => positionOf(s)),
    [stars, previewMap]
  );
  const liveBBox = useMemo(
    () => computeBBoxFromPoints(livePoints),
    [livePoints]
  );

  // locked 진입 시 1회 초기 스케일 적용
  useEffect(() => {
    if (locked && !didInitialScaleRef.current) {
      didInitialScaleRef.current = true;
      committedMapRef.current = Object.fromEntries(
        stars.map((s) => [s.id, { x: s.x, y: s.y }])
      );
      scaleRef.current = 1;
      setScaleUI(initialScaleOnLock);
      applyScalePreview(initialScaleOnLock, {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locked]);

  // px->rel
  const toRel = (clientX, clientY) => {
    const r = containerRef.current.getBoundingClientRect();
    return {
      x: clamp01((clientX - r.left) / r.width),
      y: clamp01((clientY - r.top) / r.height),
    };
  };

  // =====================
  // 그룹 드래그 (locked=true, 별/간선/배경에서 시작 가능)
  // =====================
  const startMoveDrag = (e) => {
    if (!locked || !liveBBox) return;

    e.preventDefault();
    e.stopPropagation();
    try {
      e.currentTarget?.setPointerCapture?.(e.pointerId);
    } catch {}

    const startRel = toRel(e.clientX, e.clientY);
    const baseMap =
      committedMapRef.current ??
      Object.fromEntries(stars.map((s) => [s.id, { x: s.x, y: s.y }]));

    groupDragRef.current = {
      pointerId: e.pointerId,
      startRel,
      bbox0: computeBBoxFromPoints(Object.values(baseMap)),
      originMap: baseMap,
    };

    setIsSelected(true);
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
      committedMapRef.current = { ...previewMap };
      onTransformEnd?.(previewMap); // StarSky.jsx에서 서버 저장(유지/비활성 선택 가능)
    }
    groupDragRef.current = null;
  };

  // ===== 배경 클릭: 선택 해제만 수행 =====
  const onBackgroundPointerDown = (e) => {
    if (!locked) return;
    e.preventDefault();
    e.stopPropagation();
    setIsSelected(false); // 선택 해제
    setHover({ show: false, x: 0, y: 0 });
    // 배경에서 드래그 이동을 시작하고 싶다면 아래 주석 해제:
    // startMoveDrag(e);
  };

  // =====================
  // 개별 별 드래그 (!locked)
  // =====================
  const onStarPointerDown = (e, star) => {
    if (locked) {
      // 잠금: 별 위에서 시작해도 그룹 드래그
      startMoveDrag(e);
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
      Object.fromEntries(stars.map((s) => [s.id, { x: s.x, y: s.y }]));
    const next = { ...base, [star.id]: { x: nx, y: ny } };

    setStarDrag((s) => (s ? { ...s, moved } : s));
    setPreviewMap(next);
    onMove?.(star.id, nx, ny); // StarSky.jsx에서 PATCH
  };

  const onStarPointerUp = (e, star) => {
    if (!starDrag || starDrag.id !== star.id) return;
    e.preventDefault();
    try {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    } catch {}

    if (!starDrag.moved) {
      if (!locked) toggleSelect(star.id);
    }
    setStarDrag(null);
  };

  // 스케일 (절대 0.2~0.5)
  const applyScalePreview = (
    newScale,
    { commit = false, forceFromScale } = {}
  ) => {
    const baseMap =
      committedMapRef.current ??
      Object.fromEntries(stars.map((s) => [s.id, { x: s.x, y: s.y }]));
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

    // 경계 보정
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

  // 툴팁(기존 hover 좌표는 유지, 하지만 라벨은 별자리 중심 기준으로 렌더)
  const showTooltip = (e) => {
    const r = containerRef.current.getBoundingClientRect();
    setHover({ show: true, x: e.clientX - r.left, y: e.clientY - r.top });
  };
  const hideTooltip = () => setHover({ show: false, x: 0, y: 0 });

  // 선택 토글
  const toggleSelect = (id) => {
    if (!onSelectChange) return;
    if (selectedIds.includes(id))
      onSelectChange(selectedIds.filter((x) => x !== id));
    else onSelectChange([...selectedIds, id]);
  };

  const firstMonth = monthPairIndex * 2;
  const secondMonth = firstMonth + 1;

  const showSelectionAura = locked && isSelected;

  // ✅ 현재 화면상의 좌표 맵 헬퍼
  const getCurrentMap = () => {
    if (previewMap) return previewMap;
    return Object.fromEntries(stars.map((s) => [s.id, { x: s.x, y: s.y }]));
  };

  // ✅ 라벨(이름/날짜) 노출 조건 & 위치(별자리 바운딩박스 상단 중앙, % 단위)
  const showLabel =
    locked && (hover.show || isSelected || !!groupDragRef.current);
  const labelLeft = liveBBox ? `${liveBBox.cx * 100}%` : "0%";
  const labelTop = liveBBox ? `${liveBBox.minY * 100}%` : "0%";

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
        {/* ==== 간선 레이어 ==== */}
        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 2 }}>
          {showSelectionAura && (
            <defs>
              <filter
                id="softGlow"
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feGaussianBlur
                  in="SourceGraphic"
                  stdDeviation="1.4"
                  result="blur"
                />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
          )}

          {edges.map(([a, b], idx) => {
            const pa = stars.find((s) => s.id === a);
            const pb = stars.find((s) => s.id === b);
            if (!pa || !pb) return null;
            const p1 = positionOf(pa);
            const p2 = positionOf(pb);

            return (
              <g key={idx}>
                {showSelectionAura && (
                  <line
                    x1={`${p1.x * 100}%`}
                    y1={`${p1.y * 100}%`}
                    x2={`${p2.x * 100}%`}
                    y2={`${p2.y * 100}%`}
                    stroke="#7cf5ff"
                    strokeOpacity="0.22"
                    strokeWidth="4"
                    strokeLinecap="round"
                    filter="url(#softGlow)"
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
                  style={{ cursor: locked ? "pointer" : "default" }} // ✅ 호버 시 pointer
                  onPointerDown={(e) => {
                    if (!locked) return;
                    startMoveDrag(e);
                  }}
                  onMouseEnter={showTooltip}
                  onMouseLeave={hideTooltip}
                />
              </g>
            );
          })}
        </svg>

        {/* ==== 별 레이어 ==== */}
        {stars.map((s) => {
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
              {/* 전체 선택 아우라 */}
              {showSelectionAura && (
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

              {/* 편집모드 선택 Glow */}
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
                  cursor: locked ? "pointer" : "grab", // ✅ 호버 시 pointer
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

        {/* ✅ 라벨: 별자리 이동/스케일에 따라 함께 이동 (bbox 기준) */}
        {showLabel && liveBBox && (
          <div
            className="absolute z-20 bg-black/75 text-white text-[11px] px-2 py-1 rounded"
            style={{
              left: labelLeft,
              top: labelTop,
              transform: "translate(-50%, -120%)", // 박스 위에 살짝 띄우기
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
      </div>

      {/* 우측 스케일 패널(locked 전용) */}
      {locked && isSelected && (
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
              applyScalePreview(v);
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
              // 1) 스케일 미리보기 커밋
              applyScalePreview(scaleUI, { commit: true });
              // 2) 현재 좌표 맵 가져와 부모로 전달 → 서버 저장
              const map = committedMapRef.current || getCurrentMap();
              onApply?.(map);
            }}
          >
            적용
          </button>
        </div>
      )}

      {/* 월 네비게이션 */}
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
          <span>{MONTH_ABBR[monthPairIndex * 2]}</span>
          <span>/</span>
          <span>{MONTH_ABBR[monthPairIndex * 2 + 1]}</span>
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
        @media (prefers-reduced-motion: reduce) {
          .animate-pulse, [style*="animation: pulseSoft"] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
