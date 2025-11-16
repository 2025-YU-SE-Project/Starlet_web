import React, { useEffect, useRef, useState } from "react";
import backgroundImg from "../assets/background.png";

const MIN_NODES = 7;
const MAX_NODES = 14;
const clamp01 = (v) => Math.max(0, Math.min(1, v));

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

  const panelRef = useRef(null);
  const dragIdRef = useRef(null);

  const toRel = (clientX, clientY) => {
    const r = panelRef.current.getBoundingClientRect();
    return {
      x: clamp01((clientX - r.left) / r.width),
      y: clamp01((clientY - r.top) / r.height),
    };
  };

  useEffect(() => {
    if (!open) return;

  
    setStep(isEdit ? 2 : 1);
    setName(initial?.name ?? "");
    setDesc(initial?.desc ?? initial?.description ?? "");
    setWarn("");

    const init = {};
    (stars || []).forEach((s) => {
      init[s.id] = {
        x: typeof s.x === "number" ? clamp01(s.x) : 0.5,
        y: typeof s.y === "number" ? clamp01(s.y) : 0.5,
      };
    });

    setStarPositions(init);
    setEdges(initial?.lines ?? []);
    setSelectedStar(null);

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, initial, stars, isEdit]);

  useEffect(() => {
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, []);

  const onPointerDownStar = (e, id) => {
    // 생성 1단계에서만 드래그 가능
    if (isEdit || step !== 1) return;
    e.preventDefault();
    e.stopPropagation();
    setWarn("");

    dragIdRef.current = id;
    window.addEventListener("pointermove", onPointerMove, { passive: false });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
  };

  const onPointerMove = (e) => {
    if (!dragIdRef.current || !panelRef.current || isEdit || step !== 1) return;
    e.preventDefault();

    const { x, y } = toRel(e.clientX, e.clientY);
    const id = dragIdRef.current;

    setStarPositions((prev) => ({ ...prev, [id]: { x, y } }));
  };

  const onPointerUp = () => {
    dragIdRef.current = null;
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
  };

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
    // 생성 1단계에서만 연결 가능
    if (isEdit || step !== 1) return;

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

  const goNext = () => {
    if (nodeCount < MIN_NODES || nodeCount > MAX_NODES) {
      setWarn(
        `별자리는 연결된 별이 ${MIN_NODES}~${MAX_NODES}개여야 해요. (현재: ${nodeCount}개)`
      );
      return;
    }

    setWarn("");
    setSelectedStar(null);
    setStep(2);
  };

  const canFinish = name.trim().length > 0 && desc.trim().length > 0;

  const finish = () => {
    if (!canFinish) return;

    const trimmedName = name.trim();
    const trimmedDesc = desc.trim();
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
        name: trimmedName,
        description: trimmedDesc,
      });
      return;
    }

    onSubmit?.({
      name: trimmedName,
      desc: trimmedDesc,
      lines: edges,
      starPositions,
      constellationCreatedAt: createdAt,
    });
  };

 if (!open) return null;


  const interactive = !isEdit && step === 1;


  let renderPositions = starPositions;

  if (!interactive) {
    const ids = Object.keys(starPositions);
    if (ids.length > 0) {
      let minX = 1, maxX = 0, minY = 1, maxY = 0;

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
      const margin = 0.12;

      const scaled = {};
      ids.forEach((id) => {
        const p = starPositions[id];
        if (!p) return;

        const nx = (p.x - minX) / spanX;
        const ny = (p.y - minY) / spanY;

        scaled[id] = {
          x: margin + nx * (1 - margin * 2),
          y: margin + ny * (1 - margin * 2),
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
        className="relative w-[950px] max-w-[96vw] rounded-[26px] flex flex-col"
        style={{
          backgroundColor: "#f3f4f6",
          boxShadow: "0 14px 40px rgba(0,0,0,0.35)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
 
        <div
          className="flex items-center justify-between px-7 h-[64px] rounded-t-[26px]"
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
              }
            }}
            className="text-[24px] text-black/70 hover:text-black leading-none"
          >
            {isEdit ? "×" : step === 1 ? "×" : "←"}
          </button>

          <div className="text-[20px] font-semibold text-black">
            {isEdit ? "별자리 수정" : "별자리 생성"}
          </div>

          {step === 1 && !isEdit ? (
            <button
              onClick={goNext}
              className="text-[15px] font-semibold text-[#111827]"
            >
              다음
            </button>
          ) : (
            <button
              onClick={finish}
              disabled={!canFinish}
              className={`text-[15px] font-semibold ${
                canFinish ? "text-[#111827]" : "text-black/30 cursor-not-allowed"
              }`}
            >
              완료
            </button>
          )}
        </div>


        <div className="flex flex-col items-center px-10 py-6 gap-4">
          {!isEdit && step === 1 && (
            <p className="text-[13px] text-black/60">
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
             <svg className="absolute inset-0 w-full h-full pointer-events-none">
  {edges.map(([a, b], idx) => {
    const pa = renderPositions[a];  
    const pb = renderPositions[b];
    if (!pa || !pb) return null;

    return (
      <line
        key={idx}
        x1={`${pa.x * 100}%`}
        y1={`${pa.y * 100}%`}
        x2={`${pb.x * 100}%`}
        y2={`${pb.y * 100}%`}
        stroke="#ffffff"
        strokeOpacity="0.95"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    );
  })}
</svg>

{stars.map((s) => {
  const p = renderPositions[s.id];   
  if (!p) return null;

  const imgSrc = colorImageMap[s.color];
  if (!imgSrc) return null;

  const isSelected = interactive && selectedStar === s.id;

  return (
    <img
      key={s.id}
      src={imgSrc}
      alt={s.color}
      draggable={false}
      onPointerDown={
        interactive ? (e) => onPointerDownStar(e, s.id) : undefined
      }
      onClick={interactive ? () => onClickStar(s.id) : undefined}
      style={{
        position: "absolute",
        left: `${p.x * 100}%`,
        top: `${p.y * 100}%`,
        transform: "translate(-50%, -50%)",
        width: 22,
        height: 22,
        userSelect: "none",
        touchAction: "none",
        cursor: interactive ? "grab" : "default",
        filter: isSelected
          ? "drop-shadow(0 0 8px rgba(255,255,255,0.9))"
          : "none",
        animation: isSelected
          ? "twinkleStar 0.9s ease-in-out infinite alternate"
          : "none",
        pointerEvents: interactive ? "auto" : "none",
      }}
    />
  );
})}

            </div>

       
            {interactive && (
              <div className="flex gap-3">
                <button
                  onClick={clearLines}
                  disabled={edges.length === 0}
                  className={`px-5 py-2 rounded-[999px] text-[13px] ${
                    edges.length === 0
                      ? "bg-[#e5e7eb] text-black/35 cursor-not-allowed"
                      : "bg-[#e5e7eb] text-black/70 hover:bg-[#d4d7dd]"
                  }`}
                >
                  전체 삭제
                </button>

                <button
                  onClick={removeLastLine}
                  disabled={edges.length === 0}
                  className={`px-5 py-2 rounded-[999px] text-[13px] ${
                    edges.length === 0
                      ? "bg-[#e5e7eb] text-black/35 cursor-not-allowed"
                      : "bg-[#e5e7eb] text-black/70 hover:bg-[#d4d7dd]"
                  }`}
                >
                  마지막 선 지우기
                </button>
              </div>
            )}

    
            {step === 2 && (
              <div className="flex flex-col items-center w-full gap-4">
                <h2 className="text-[17px] font-semibold text-black/80">
                  별자리 이름을 지정해주세요
                </h2>

                <div className="w-[380px] flex flex-col gap-3">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="미지정 별자리"
                    className="w-full h-[44px] rounded-full bg-white px-5 text-[14px] text-black outline-none border border-black/10 focus:border-[#4b5563]"
                  />

                  <input
                    type="text"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="별자리에 대한 소개를 작성해주세요"
                    className="w-full h-[44px] rounded-full bg-white px-5 text-[14px] text-black outline-none border border-black/10 focus:border-[#4b5563]"
                  />
                </div>
              </div>
            )}

            {warn && (
              <div className="text-[12px] text-red-700 bg-red-50/80 border border-red-200 px-3 py-2 rounded-lg">
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
