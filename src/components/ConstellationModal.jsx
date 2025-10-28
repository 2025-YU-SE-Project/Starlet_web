// src/components/ConstellationModal.jsx
import React, { useEffect, useRef, useState } from "react";

const MIN_NODES = 7;
const MAX_NODES = 14;

const ConstellationModal = ({
  open,
  onClose,
  onSubmit,
  initial,
  stars = [],
  colorImageMap = {}, // 색상 → 이미지 매핑 (YELLOW, BLUE, ...)
}) => {
  const [name, setName] = useState(initial?.name ?? "");
  const [desc, setDesc] = useState(initial?.desc ?? "");

  // 모달 내 별 좌표 (0~1, 상대좌표)
  const [starPositions, setStarPositions] = useState({});
  // 연결된 간선들 [[idA,idB], ...]
  const [edges, setEdges] = useState([]);
  // 선택된 별 (간선 만들기 위한 1차 선택)
  const [selectedStar, setSelectedStar] = useState(null);
  // 경고/안내 메시지
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

  // 🔁 열릴 때마다 초기화 (훅 순서 고정)
  useEffect(() => {
    if (!open) return;

    setName(initial?.name ?? "");
    setDesc(initial?.desc ?? "");
    setWarn("");

    // 현재 밤하늘 별들을 모달 캔버스에 복사 (좌표 없으면 중앙 근처)
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

    // 바디 스크롤 잠금
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, initial, stars]);

  // 포인터 리스너 정리
  useEffect(() => {
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ====== 드래그 이동 ======
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

  // ====== 간선 추가: 사이클 금지 + 노드 수 제한 체크 ======
  const edgeKey = (a, b) => (a < b ? `${a}__${b}` : `${b}__${a}`);

  // 사이클 검사 (Disjoint Set / Union-Find)
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
    // 이미 같은 집합이면 a-b 추가 시 사이클
    return find(a) === find(b);
  };

  const addEdgeIfValid = (a, b) => {
    if (a === b) return;

    // 이미 존재하는 간선?
    const exists = edges.some(
      ([u, v]) => (u === a && v === b) || (u === b && v === a)
    );
    if (exists) return;

    // 사이클 금지
    if (willFormCycle(a, b, edges)) {
      setWarn("선이 순환(사이클)되면 안 돼요. 다른 별을 선택해보세요.");
      return;
    }

    // 노드 수 제한(추가하려는 간선이 노드 수를 14개 초과하게 만드는지 사전 체크)
    const nodeSet = new Set(edges.flat());
    nodeSet.add(a);
    nodeSet.add(b);
    if (nodeSet.size > MAX_NODES) {
      setWarn(`연결된 별은 최대 ${MAX_NODES}개까지예요.`);
      return;
    }

    // 추가
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

  // ====== 제출: 연결된 노드 수 7~14 만족해야 함 ======
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
      starPositions, // 선택 좌표
    });
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center px-3 md:px-6"
      role="dialog"
      aria-modal="true"
    >
      {/* 반투명 배경 클릭 시 닫기 */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 유리(Glass) 카드 */}
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
          {/* 좌측: 별/선 편집 캔버스 */}
          <div className="rounded-[18px] border border-black/15 bg-white/30 backdrop-blur-sm p-3">
            <div
              ref={panelRef}
              className="relative w-full aspect-[4/3] bg-white/55 rounded-[14px] border border-black/15 overflow-hidden"
              style={{ touchAction: "none" }}
            >
              {/* 연결선(SVG) */}
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

              {/* 별(이미지) */}
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
                별을 끌어 이동하고, 서로 클릭해 선을 이어보세요.
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

          {/* 우측: 입력 (가운데 정렬) */}
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
