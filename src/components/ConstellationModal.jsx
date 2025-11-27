import React, { useEffect, useRef, useState, useCallback } from "react";
import backgroundImg from "../assets/background.png";
import suggestConstellation from "../apis/Constellation/suggestConstellation";
import { MdArrowBackIosNew } from "react-icons/md";
import { normalizeStars } from "../lib/normalize";

const MIN_NODES = 7;
const MAX_NODES = 14;
const clamp01 = (v) => Math.max(0, Math.min(1, v));

const MAX_NAME_LEN = 10;
const MAX_DESC_LEN = 30;

const INNER_MARGIN = 0.03;
const clampInner = (v) => Math.max(INNER_MARGIN, Math.min(1 - INNER_MARGIN, v));

const ConstellationModal = ({
  open,
  onClose,
  onSubmit,
  initial,
  stars = [],
  colorImageMap = {},
  mode = "create",
}) => {
  const isEdit = mode === "edit";

  const [step, setStep] = useState(1);
  const [name, setName] = useState(initial?.name ?? "");
  const [desc, setDesc] = useState(initial?.desc ?? "");
  const [starPositions, setStarPositions] = useState({});
  const [edges, setEdges] = useState([]);
  const [selectedStar, setSelectedStar] = useState(null);
  const [warn, setWarn] = useState("");
  const [suggesting, setSuggesting] = useState(false);
  const [suggestInfoOpen, setSuggestInfoOpen] = useState(false);
  const [metaError, setMetaError] = useState("");

  const panelRef = useRef(null);
  const dragIdRef = useRef(null);

  const interactive = !isEdit && step === 1;

  const toRel = (clientX, clientY) => {
    const r = panelRef.current.getBoundingClientRect();
    const rawX = (clientX - r.left) / r.width;
    const rawY = (clientY - r.top) / r.height;
    return {
      x: clampInner(rawX),
      y: clampInner(rawY),
    };
  };

  useEffect(() => {
    if (!open) return;

    setStep(isEdit ? 2 : 1);
    setName((initial?.name ?? "").slice(0, MAX_NAME_LEN));
    setDesc(
      (initial?.desc ?? initial?.description ?? "").slice(0, MAX_DESC_LEN)
    );
    setWarn("");
    setMetaError("");

    const init = {};
    (stars || []).forEach((s) => {
      init[s.id] = {
        x: typeof s.x === "number" ? clampInner(s.x) : 0.5,
        y: typeof s.y === "number" ? clampInner(s.y) : 0.5,
      };
    });

    setStarPositions(init);
    setEdges(initial?.lines ?? []);
    setSelectedStar(null);

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, isEdit, initial, stars]);

  const onPointerMove = useCallback(
    (e) => {
      if (!dragIdRef.current || !panelRef.current || !interactive) return;
      e.preventDefault();

      const { x, y } = toRel(e.clientX, e.clientY);
      const id = dragIdRef.current;

      setStarPositions((prev) => ({
        ...prev,
        [id]: { x, y },
      }));
    },
    [interactive]
  );

  const onPointerUp = useCallback(() => {
    dragIdRef.current = null;
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
  }, [onPointerMove]);

  const onPointerDownStar = (e, id) => {
    if (!interactive) return;
    e.preventDefault();
    e.stopPropagation();
    setWarn("");

    dragIdRef.current = id;
    window.addEventListener("pointermove", onPointerMove, { passive: false });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
  };

  useEffect(() => {
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [onPointerMove, onPointerUp]);

  const addEdgeIfValid = (a, b) => {
    if (a === b) return;

    const exists = edges.some(
      ([u, v]) => (u === a && v === b) || (u === b && v === a)
    );
    if (exists) return;

    const nodeSet = new Set(edges.flat());
    nodeSet.add(a);
    nodeSet.add(b);

    if (nodeSet.size > MAX_NODES) {
      setWarn(`연결된 별은 최대 ${MAX_NODES}개까지예요.`);
      return;
    }

    setEdges((prev) => [...prev, [a, b]]);
    setWarn("");
    setSelectedStar(null);
  };

  const onClickStar = (id) => {
    if (!interactive) return;

    if (!selectedStar) {
      setSelectedStar(id);
      setWarn("");
      return;
    }

    if (selectedStar === id) {
      setSelectedStar(null);
      return;
    }

    addEdgeIfValid(selectedStar, id);
  };

  const removeLastLine = () => {
    setWarn("");
    setEdges((prev) => prev.slice(0, -1));
  };

  const clearLines = () => {
    setWarn("");
    setEdges([]);
  };

  const nodeCount = new Set(edges.flat()).size;

  const selectedCount = Object.keys(starPositions).length;

  const goNext = () => {
    if (selectedCount < MIN_NODES || selectedCount > MAX_NODES) {
      setWarn(
        `별자리는 ${MIN_NODES}~${MAX_NODES}개의 별로 만들어야 해요. (선택한 별: ${selectedCount}개)`
      );
      return;
    }

    if (nodeCount !== selectedCount) {
      setWarn(
        `선택한 ${selectedCount}개의 별이 모두 연결되어야 해요. (현재 연결된 별: ${nodeCount}개)`
      );
      return;
    }

    setWarn("");
    setSelectedStar(null);
    setStep(2);
  };

  const canFinish =
    name.trim().length > 0 &&
    name.trim().length <= MAX_NAME_LEN &&
    desc.trim().length > 0 &&
    desc.trim().length <= MAX_DESC_LEN;

  const finish = () => {
    if (!canFinish) return;

    const trimmedName = name.trim();
    const trimmedDesc = desc.trim();

    setMetaError("");

    if (
      trimmedName.length > MAX_NAME_LEN ||
      trimmedDesc.length > MAX_DESC_LEN
    ) {
      if (
        trimmedName.length > MAX_NAME_LEN &&
        trimmedDesc.length > MAX_DESC_LEN
      ) {
        setMetaError(
          `별자리 이름은 ${MAX_NAME_LEN}자 이내, 설명은 ${MAX_DESC_LEN}자 이내로 입력해주세요.`
        );
      } else if (trimmedName.length > MAX_NAME_LEN) {
        setMetaError(`별자리 이름은 ${MAX_NAME_LEN}자 이내로 입력해주세요.`);
      } else {
        setMetaError(`별자리 설명은 ${MAX_DESC_LEN}자 이내로 입력해주세요.`);
      }
      return;
    }

    const trimmedNameFinal = trimmedName;
    const trimmedDescFinal = trimmedDesc;
    const createdAt =
      initial?.constellationCreatedAt || new Date().toISOString();

    if (isEdit) {
      const id = initial?.constellationId ?? initial?.id;
      if (!id) {
        console.warn("수정 모드인데 id가 없습니다.");
        return;
      }
      onSubmit?.({
        id,
        name: trimmedNameFinal,
        description: trimmedDescFinal,
      });
      onClose?.();
      return;
    }

    onSubmit?.({
      name: trimmedNameFinal,
      desc: trimmedDescFinal,
      lines: edges,
      starPositions,
      constellationCreatedAt: createdAt,
    });
    onClose?.();
  };

  const handleSuggest = async () => {
    if (!Object.keys(starPositions).length) {
      setWarn("별을 먼저 선택해서 별자리를 만들어주세요.");
      return;
    }

    try {
      setSuggesting(true);
      setWarn("");

      const starIds = Object.keys(starPositions).map((id) => Number(id));

      const data = await suggestConstellation(starIds);
      if (data?.name) setName(data.name);
      if (data?.description) setDesc(data.description);
    } catch (e) {
      console.error("별자리 추천 실패:", e);
      setWarn("별자리 이름/설명 추천에 실패했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setSuggesting(false);
    }
  };

  if (!open) return null;

  let renderPositions = starPositions;

  if (isEdit) {
    const ns = normalizeStars(
      (stars || []).map((s) => ({
        ...s,
        starId: s.id ?? s.starId,
      })),
      { w: 100, h: 100, pad: 8 }
    );

    const pos = {};
    ns.forEach((s) => {
      const key = s.starId ?? s.id;

      pos[key] = {
        x: s._nx / 100,
        y: s._ny / 100,
      };
    });

    renderPositions = pos;
  } else if (!interactive) {
    const ids = Object.keys(starPositions);
    if (ids.length > 0) {
      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;

      ids.forEach((id) => {
        const p = starPositions[id];
        if (!p) return;
        minX = Math.min(minX, p.x);
        maxX = Math.max(maxX, p.x);
        minY = Math.min(minY, p.y);
        maxY = Math.max(maxY, p.y);
      });

      const spanX = Math.max(maxX - minX, 0.001);
      const spanY = Math.max(maxY - minY, 0.001);

      const padding = 0.08;
      const innerW = 1 - padding * 2;
      const innerH = 1 - padding * 2;
      const scale = Math.min(innerW / spanX, innerH / spanY);

      const offsetX = (1 - scale * spanX) / 2;
      const offsetY = (1 - scale * spanY) / 2;

      const scaled = {};
      ids.forEach((id) => {
        const p = starPositions[id];
        if (!p) return;
        scaled[id] = {
          x: offsetX + (p.x - minX) * scale,
          y: offsetY + (p.y - minY) * scale,
        };
      });

      renderPositions = scaled;
    }
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      style={{
        background: "rgba(0,0,0,0.28)",
        backdropFilter: "blur(2px)",
      }}
    >
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div
        className="relative w-[950px] max-w-[96vw] rounded-[12px] flex flex-col"
        style={{
          backgroundColor: "#f3f4f6",
          boxShadow: "0 14px 40px rgba(0,0,0,0.35)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-7 h-[85px] rounded-t-[26px]"
          style={{
            backgroundColor: "#e4e5e7",
            borderBottom: "1px solid rgba(0,0,0,0.08)",
          }}
        >
          <button
            onClick={() => {
              if (isEdit || step === 1) onClose?.();
              else {
                setStep(1);
                setWarn("");
                setSelectedStar(null);
                setMetaError("");
              }
            }}
            className="text-[29px] text-black/70 hover:text-black leading-none cursor-pointer"
          >
            {isEdit ? "×" : step === 1 ? "" : <MdArrowBackIosNew />}
          </button>

          <div className="text-[29px] font-medium text-[#4F4F4F]">
            {isEdit ? "별자리 수정" : "별자리 생성"}
          </div>

          {step === 1 && !isEdit ? (
            <button
              onClick={goNext}
              className="text-[26px] font-medium text-[#4F4F4F] cursor-pointer"
            >
              다음
            </button>
          ) : (
            <button
              onClick={finish}
              disabled={!canFinish}
              className={`text-[26px] font-medium ${
                canFinish
                  ? "text-[#4F4F4F] cursor-pointer"
                  : "text-black/30 cursor-not-allowed"
              }`}
            >
              완료
            </button>
          )}
        </div>


        <div className="flex flex-col items-center px-10 py-6 gap-2">

          {!isEdit && step === 1 && (
            <p className="text-[16px] text-[#4F4F4FB2]">
              *별을 끌어 이동하고, 서로 연결하여 별자리를 완성해보세요
            </p>
          )}

          <div className="flex flex-col items-center gap-5">
            <div
              ref={panelRef}
              className="relative w-[440px] max-w-full aspect-square rounded-[26px] overflow-hidden"
              style={{
                backgroundImage: `url(${backgroundImg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                border: "1px solid rgba(0,0,0,0.12)",
              }}
            >
              <svg
                viewBox="0 0 100 100"
                width="100%"
                height="100%"
                className="block"
              >
                <defs>
                  <filter
                    id="star-glow"
                    x="-50%"
                    y="-50%"
                    width="200%"
                    height="200%"
                  >
                    <feGaussianBlur
                      in="SourceGraphic"
                      stdDeviation="2.5"
                      result="b1"
                    />
                    <feGaussianBlur
                      in="SourceGraphic"
                      stdDeviation="2.0"
                      result="b2"
                    />
                    <feMerge>
                      <feMergeNode in="b1" />
                      <feMergeNode in="b2" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>

                  <radialGradient
                    id="selected-star-red"
                    cx="50%"
                    cy="50%"
                    r="50%"
                  >
                    <stop offset="0%" stopColor="#ff3246" stopOpacity="0.85" />
                    <stop offset="40%" stopColor="#ff465a" stopOpacity="0.45" />
                    <stop offset="70%" stopColor="#ff465a" stopOpacity="0.15" />
                    <stop offset="85%" stopColor="#ff0014" stopOpacity="0" />
                  </radialGradient>
                </defs>

                <g className="[mix-blend-mode:screen]">
                  {edges.map(([a, b], idx) => {
                    const pa = renderPositions[a];
                    const pb = renderPositions[b];
                    if (!pa || !pb) return null;
                    return (
                      <line
                        key={`${a}-${b}-${idx}`}
                        x1={pa.x * 100}
                        y1={pa.y * 100}
                        x2={pb.x * 100}
                        y2={pb.y * 100}
                        stroke="#CBE1FF"
                        strokeWidth="0.5"
                        strokeOpacity="0.9"
                      />
                    );
                  })}
                </g>

                {(stars || []).map((s, i) => {
                  const p = renderPositions[s.id];
                  if (!p) return null;

                  const colorKey = (s.color || "").toUpperCase();
                  const icon = colorImageMap[colorKey];
                  if (!icon) return null;

                  const isSelected = interactive && selectedStar === s.id;
                  const delayMs = `${((s.id ?? i) * 137) % 1200}ms`;

                  return (
                    <g key={s.id ?? i}>
                      {isSelected && (
                        <circle
                          cx={p.x * 100}
                          cy={p.y * 100}
                          r={7}
                          fill="url(#selected-star-red)"
                          className="selected-star-halo"
                          style={{
                            filter:
                              "blur(0.6px) drop-shadow(0 0 22px rgba(255,70,90,1))",
                          }}
                        />
                      )}

                      <image
                        href={icon}
                        x={p.x * 100 - 3}
                        y={p.y * 100 - 3}
                        width={6}
                        height={6}
                        filter="url(#star-glow)"
                        className="animate-pulse [animation-duration:900ms]"
                        style={{
                          animationDelay: delayMs,
                          transformOrigin: "center",
                          transformBox: "fill-box",
                          cursor: interactive ? "grab" : "default",
                          pointerEvents: interactive ? "auto" : "none",
                        }}
                        onPointerDown={
                          interactive
                            ? (e) => onPointerDownStar(e, s.id)
                            : undefined
                        }
                        onClick={
                          interactive ? () => onClickStar(s.id) : undefined
                        }
                      />

                      <circle
                        cx={p.x * 100}
                        cy={p.y * 100}
                        r={0.5}
                        fill="#ffffff"
                        style={{
                          filter: isSelected
                            ? "drop-shadow(0 0 14px rgba(255,90,110,1))"
                            : "drop-shadow(0 0 4px rgba(255,255,255,0.85))",
                        }}
                      />
                    </g>
                  );
                })}
              </svg>
            </div>

            {interactive && (
              <div className="flex gap-3">
                <button
                  onClick={clearLines}
                  disabled={edges.length === 0}
                  className={`px-5 py-2 rounded-[8px] text-[13px] ${
                    edges.length === 0
                      ? "bg-[#D9D9D9] text-black/35 cursor-not-allowed"
                      : "bg-[#D9D9D9] text-[#4F4F4FF2] hover:bg-[#d4d7dd]"
                  }`}
                >
                  전체 삭제
                </button>

                <button
                  onClick={removeLastLine}
                  disabled={edges.length === 0}
                  className={`px-5 py-2 rounded-[8px] text-[13px] ${
                    edges.length === 0
                      ? "bg-[#D9D9D9] text-black/35 cursor-not-allowed"
                      : "bg-[#D9D9D9] text-[#4F4F4FF2] hover:bg-[#d4d7dd]"
                  }`}
                >
                  마지막 선 지우기
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col items-center w-full gap-4">
                <div className="flex items-center gap-2 relative">
                  <h2 className="text-[18px] font-semibold text-black/80">
                    별자리 이름을 지정해주세요
                  </h2>

                  {!isEdit && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setSuggestInfoOpen(false);
                          handleSuggest();
                        }}
                        disabled={suggesting}

                        className={`ml-2 px-3 py-1 rounded-[8px] text-[11px] cursor-pointer ${

                          suggesting
                            ? "bg-[#e5e7eb] text-black/40 cursor-wait"
                            : "bg-[#e5e7eb] text-[#4F4F4FB2] hover:bg-[#d4d7dd]"
                        }`}
                      >
                        {suggesting ? "추천 중..." : "추천받기"}
                      </button>

                      <button
                        type="button"
                        className="w-4 h-4 ml-[-4px] rounded-full border border-[#B3B3B3] flex items-center justify-center text-[12px] text-[#B3B3B3] bg-white hover:bg-gray-50 cursor-pointer self-end"
                        onClick={() => setSuggestInfoOpen((v) => !v)}
                        onMouseEnter={() => setSuggestInfoOpen(true)}
                        onMouseLeave={() => setSuggestInfoOpen(false)}
                      >
                        ?
                      </button>

                      {suggestInfoOpen && (
                        <div className="absolute bottom-full left-1/2 translate-x-[27%] mb-4 z-50">
                          <div className="relative">
                            <div className="rounded-2xl bg-white shadow-[0_12px_30px_rgba(0,0,0,0.18)] border border-gray-100 px-6 py-4 w-[240px]">
                              <div className="inline-flex items-center px-4 py-1 rounded-md bg-[#FFE75A] text-[13px] font-semibold text-[#4b5563] mb-3">
                                별자리 네이밍 AI
                              </div>

                              <p className="text-[12px] leading-relaxed text-[#4b5563]">
                                별자리에 포함된 별들의 감정 일기에서{" "}
                                <span className="font-semibold">
                                  감정 상태 · 요인 · 내용
                                </span>
                                을 기반으로 AI가 어울리는 별자리 이름과 별자리
                                설명을 추천해줘요.
                              </p>
                            </div>

                            <div className="absolute -bottom-2 left-[25%] w-4 h-4 bg-white border-l border-b border-gray-100 rotate-45" />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="w-[450px] flex flex-col gap-3">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="미지정 별자리"
                    maxLength={MAX_NAME_LEN}
                    className="w-full h-[44px] rounded-[12px] bg-white px-5 text-[14px] text-black outline-none border border-black/10 focus:border-[#4b5563]"
                  />

                  <input
                    type="text"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="별자리에 대한 소개를 작성해주세요"
                    maxLength={MAX_DESC_LEN}
                    className="w-full h-[44px] rounded-[12px] bg-white px-5 text-[14px] text-black outline-none border border-black/10 focus:border-[#4b5563]"
                  />

                  <div className="h-[10px] flex items-center">
                    {metaError && (
                      <p className="text-[12px] text-red-600">{metaError}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {warn && (
              <div className="text-[12px] text-red-700 bg-red-50/80 border px-3 py-2 rounded-md">
                {warn}
              </div>
            )}
          </div>
        </div>

        <style>{`
          @keyframes twinkleStar {
            0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.6; }
          }
        `}</style>
      </div>
    </div>
  );
};

export default ConstellationModal;
