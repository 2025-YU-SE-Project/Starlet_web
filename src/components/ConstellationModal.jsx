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

    const initPos = {};
    (stars || []).forEach((s) => {
      initPos[s.id] = {
        x: typeof s.x === "number" ? clamp01(s.x) : 0.5,
        y: typeof s.y === "number" ? clamp01(s.y) : 0.5,
      };
    });
    setStarPositions(initPos);
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
      setWarn("선이 순환되면 안 돼요. 다른 별을 이어주세요.");
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
    const connectedNodeSet = new Set(edges.flat());
    const connectedCount = connectedNodeSet.size;

    if (connectedCount < MIN_NODES || connectedCount > MAX_NODES) {
      setWarn(
        `별자리는 연결된 별이 ${MIN_NODES}~${MAX_NODES}개여야 해요. (현재 ${connectedCount}개)`
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
      className="fixed inset-0 z-[9999] flex items-center justify-center px-3 md:px-6"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="
          relative w-full max-w-6xl rounded-3xl border border-white/35
          bg-white/20 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.35)]
          p-5 md:p-8
        "
      >
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-black/80 hover:text-black text-2xl"
          aria-label="닫기"
        >
          ←
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
          <div className="rounded-[18px] border border-black/15 bg-white/30 backdrop-blur-sm p-3">
            <div
              ref={panelRef}
              className="relative w-full aspect-[4/3] bg-white/55 rounded-[14px] border border-black/15 overflow-hidden"
              style={{ touchAction: "none" }}
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
                      stroke="#2A3A86"
                      strokeOpacity="0.9"
                      strokeWidth="2.2"
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
                      width: 22,
                      height: 22,
                      userSelect: "none",
                      touchAction: "none",
                      cursor: "grab",
                      filter: selected
                        ? "drop-shadow(0 0 6px rgba(17,24,39,.5))"
                        : "none",
                    }}
                  />
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-between">
              <p className="text-sm text-black/70">
                별을 끌어 이동하고, 서로 클릭해서 선을 이어보세요.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={removeLastLine}
                  disabled={edges.length === 0}
                  className="px-3 py-1.5 text-sm rounded-lg text-black bg-white/70 border border-black/10 hover:bg-white/90 disabled:opacity-40"
                >
                  마지막 선 취소
                </button>
                <button
                  onClick={clearLines}
                  disabled={edges.length === 0}
                  className="px-3 py-1.5 text-sm rounded-lg text-black bg-white/70 border border-black/10 hover:bg-white/90 disabled:opacity-40"
                >
                  전체 선 지우기
                </button>
              </div>
            </div>

            {warn && (
              <div className="mt-2 text-sm text-red-700 bg-red-50/70 border border-red-200 px-3 py-2 rounded">
                {warn}
              </div>
            )}
          </div>

          <div className="flex flex-col items-center justify-center text-center h-full">
            <h2 className="text-2xl md:text-3xl font-extrabold text-black">
              별자리 이름을 지정해주세요
            </h2>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="미지정 별자리"
              className="text-black mt-6 w-full max-w-md rounded-lg bg-white px-4 py-3 
               outline-none border border-black/10 focus:border-black/30"
            />

            <input
              type="text"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="별자리에 대한 소개를 작성해주세요"
              className="text-black mt-3 w-full max-w-md rounded-lg bg-white px-4 py-3 
               outline-none border border-black/10 focus:border-black/30"
            />

            <button
              onClick={submit}
              className="mt-6 px-10 py-2 rounded-lg bg-green-800 text-white 
               font-semibold hover:bg-green-700 self-center"
            >
              설 정
            </button>

            <div className="mt-3 text-xs text-black/60">
              연결된 별 개수는 {MIN_NODES}~{MAX_NODES}개여야 합니다.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConstellationModal;
