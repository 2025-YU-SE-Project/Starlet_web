import React, { useEffect, useRef, useState } from "react";

const MIN_NODES = 7;
const MAX_NODES = 14;

const ConstellationModal = ({
  open,
  onClose,
  onSubmit,
  initial,
  stars = [],
  colorImageMap = {},
}) => {
  const [name, setName] = useState(initial?.name ?? "");
  const [desc, setDesc] = useState(initial?.desc ?? "");
  const [starPositions, setStarPositions] = useState({});
  const [edges, setEdges] = useState([]);
  const [selectedStar, setSelectedStar] = useState(null);
  const [warn, setWarn] = useState("");

  const panelRef = useRef(null);
  const dragIdRef = useRef(null);

  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const toRel = (clientX, clientY) => {
    const r = panelRef.current.getBoundingClientRect();
    return {
      x: clamp01((clientX - r.left) / r.width),
      y: clamp01((clientY - r.top) / r.height),
    };
  };

  useEffect(() => {
    if (!open) return;

    setName(initial?.name ?? "");
    setDesc(initial?.desc ?? "");
    setWarn("");

    const init = {};
    (stars || []).forEach((s) => {
      init[s.id] = {
        x: typeof s.x === "number" ? clamp01(s.x) : 0.5,
        y: typeof s.y === "number" ? clamp01(s.y) : 0.5,
      };
    });
    setStarPositions(init);
    setEdges([]);
    setSelectedStar(null);

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, initial, stars]);

  useEffect(() => {
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, []);

  const onPointerDownStar = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setWarn("");
    dragIdRef.current = id;
    window.addEventListener("pointermove", onPointerMove, { passive: false });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
  };

  const onPointerMove = (e) => {
    if (!dragIdRef.current || !panelRef.current) return;
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

  const willFormCycle = (a, b, currentEdges) => {
    const parent = {};
    const find = (x) => {
      if (parent[x] == null) parent[x] = x;
      if (parent[x] === x) return x;
      parent[x] = find(parent[x]);
      return parent[x];
    };
    const union = (x, y) => {
      const rx = find(x);
      const ry = find(y);
      if (rx === ry) return false;
      parent[ry] = rx;
      return true;
    };
    for (const [u, v] of currentEdges) union(u, v);
    return find(a) === find(b);
  };

  const addEdgeIfValid = (a, b) => {
    if (a === b) return;

    const exists = edges.some(
      ([u, v]) => (u === a && v === b) || (u === b && v === a)
    );
    if (exists) return;

    if (willFormCycle(a, b, edges)) {
      setWarn("선이 순환(사이클)되면 안 돼요. 다른 별을 선택해보세요.");
      return;
    }

    const nodeSet = new Set(edges.flat());
    nodeSet.add(a);
    nodeSet.add(b);
    if (nodeSet.size > MAX_NODES) {
      setWarn(`연결된 별은 최대 ${MAX_NODES}개까지예요.`);
      return;
    }

    setEdges((prev) => [...prev, [a, b]]);
    setWarn("");
  };

  const onClickStar = (id) => {
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
    setSelectedStar(null);
  };

  const removeLastLine = () => {
    setWarn("");
    setEdges((prev) => prev.slice(0, -1));
  };

  const clearLines = () => {
    setWarn("");
    setEdges([]);
  };

  const submit = () => {
    const nodeSet = new Set(edges.flat());
    const cnt = nodeSet.size;
    if (cnt < MIN_NODES || cnt > MAX_NODES) {
      setWarn(
        `별자리는 연결된 별이 ${MIN_NODES}~${MAX_NODES}개여야 해요. (현재: ${cnt}개)`
      );
      return;
    }
    onSubmit?.({
      name: name.trim(),
      desc: desc.trim(),
      lines: edges,
      starPositions,
    });
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      style={{
        background:
          "radial-gradient(circle at 10% 10%, rgba(255,255,255,0.12) 0%, rgba(5,21,48,1) 45%, rgba(5,21,48,1) 100%)",
      }}
    >
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
        style={{ backdropFilter: "blur(1px)" }}
      />

      <div
        className="relative w-[1180px] max-w-[95vw] h-[650px] rounded-[28px] shadow-[0_20px_60px_rgba(0,0,0,0.35)] border border-white/25 flex"
        style={{
          background:
            "linear-gradient(180deg, rgba(246,247,250,0.3) 0%, rgba(237,239,242,0.35) 50%, rgba(232,233,236,0.2) 100%)",
          backdropFilter: "blur(16px)",
        }}
      >
        <button
          onClick={onClose}
          className="absolute right-8 top-7 text-black/70 hover:text-black text-3xl"
          aria-label="닫기"
        >
          ←
        </button>

        <div className="w-[48%] h-full flex flex-col px-7 py-6">
          <div
            ref={panelRef}
            className="relative flex-1 rounded-[20px] bg-[#dcdfe5]/60 border-[3px] border-[#b7b4b7]/80 overflow-hidden"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.25) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
              boxShadow: "inset 0 0 20px rgba(0,0,0,0.05)",
              touchAction: "none",
            }}
          >
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {edges.map(([a, b], idx) => {
                const pa = starPositions[a];
                const pb = starPositions[b];
                if (!pa || !pb) return null;
                return (
                  <line
                    key={idx}
                    x1={`${pa.x * 100}%`}
                    y1={`${pa.y * 100}%`}
                    x2={`${pb.x * 100}%`}
                    y2={`${pb.y * 100}%`}
                    stroke="#000000"
                    strokeOpacity="0.9"
                    strokeWidth="2.3"
                    strokeLinecap="round"
                  />
                );
              })}
            </svg>

            {stars.map((s) => {
              const p = starPositions[s.id];
              if (!p) return null;
              const imgSrc = colorImageMap[s.color];
              if (!imgSrc) return null;
              const selected = selectedStar === s.id;
              return (
                <img
                  key={s.id}
                  src={imgSrc}
                  alt={s.color}
                  draggable={false}
                  onPointerDown={(e) => onPointerDownStar(e, s.id)}
                  onClick={() => onClickStar(s.id)}
                  style={{
                    position: "absolute",
                    left: `${p.x * 100}%`,
                    top: `${p.y * 100}%`,
                    transform: "translate(-50%, -50%)",
                    width: 24,
                    height: 24,
                    userSelect: "none",
                    touchAction: "none",
                    cursor: "grab",
                    filter: selected
                      ? "drop-shadow(0 0 6px rgba(17,24,39,.6))"
                      : "none",
                  }}
                />
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-[13px] text-black/65">
              별을 끌어 이동하고, 서로 클릭해 선을 이어보세요.
            </p>
            <div className="flex gap-2">
              <button
                onClick={removeLastLine}
                disabled={edges.length === 0}
                className={`px-3 py-1.5 text-[12px] rounded-lg border ${
                  edges.length === 0
                    ? "bg-white/60 text-black/30 border-black/5"
                    : "bg-white/90 text-black/70 hover:bg-white border-black/10"
                }`}
              >
                마지막 선 지우기
              </button>
              <button
                onClick={clearLines}
                disabled={edges.length === 0}
                className={`px-3 py-1.5 text-[12px] rounded-lg border ${
                  edges.length === 0
                    ? "bg-white/60 text-black/30 border-black/5"
                    : "bg-white/90 text-black/70 hover:bg-white border-black/10"
                }`}
              >
                전체 선 지우기
              </button>
            </div>
          </div>

          {warn && (
            <div className="mt-2 text-[12px] text-red-700 bg-red-50/80 border border-red-200 px-3 py-2 rounded-lg">
              {warn}
            </div>
          )}
        </div>

        <div className="w-[52%] h-full flex flex-col items-center justify-center px-10 gap-6">
          <h2 className="text-[30px] font-extrabold text-black tracking-tight text-center">
            별자리 이름을 지정해주세요
          </h2>

          <div className="w-full flex flex-col gap-4 max-w-[460px]">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="미지정 별자리"
              className="w-full h-[54px] rounded-full bg-white/90 px-6 text-[15px] text-black outline-none border border-white/0 focus:border-[#146b5b]/50 shadow-[0_4px_18px_rgba(0,0,0,0.04)]"
            />

            <input
              type="text"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="별자리에 대한 소개를 작성해주세요"
              className="w-full h-[54px] rounded-full bg-white/90 px-6 text-[15px] text-black outline-none border border-white/0 focus:border-[#146b5b]/50 shadow-[0_4px_18px_rgba(0,0,0,0.04)]"
            />
          </div>

          <button
            onClick={submit}
            className="mt-2 px-16 py-2.5 rounded-[9999px] bg-[#12561f] hover:bg-[#0f491a] text-white font-semibold tracking-[0.4em]"
          >
            설 정
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConstellationModal;
