import React, { useContext, useEffect, useState } from "react";
import { CiMenuBurger } from "react-icons/ci";
import Sidebar from "../components/Sidebar";
import AuthContext from "../contexts/AuthContext";
import userGetApi from "../apis/userGetApi";
import StarArchiveCard from "../components/ArchiveCard/StarArchiveCard";
import { useConstellationArchive } from "../hooks/useConstellationArchive";
import ConstellationDetailModal from "../components/ArchiveCard/ConstellationDetailModal";
import { useConstellationDetail } from "../hooks/useConstellationDetail";
import { setRepresentative } from "../apis/constellationArchiveApi";
import RepresentativeConfirmModal from "../components/ArchiveCard/RepresentativeConfirmModal";

const StarArchive = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { accessToken } = useContext(AuthContext);
  const isLoggedIn = !!accessToken;

  const [nickname, setNickname] = useState("");
  const { data: archives, loading, error } = useConstellationArchive();
  const [archivesState, setArchivesState] = useState(null);

  const [selected, setSelected] = useState(null);
  const openDetail = !!selected;
  const selectedId = selected?.constellationId;

  const [selectedIndex, setSelectedIndex] = useState(null);

  const [repTarget, setRepTarget] = useState(null);
  const openRepModal = !!repTarget;

  const { data: detail } = useConstellationDetail(selectedId, openDetail);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  const sortArchives = (list) => {
  return [...(list || [])].sort((a, b) => {
    // 대표별자리 맨 앞 위치
    if (a.isRepresentative && !b.isRepresentative) return -1;
    if (!a.isRepresentative && b.isRepresentative) return 1;

    // 내림차순
    const da = new Date(a.date);
    const db = new Date(b.date);

    return db.getTime() - da.getTime(); 
  });
};


useEffect(() => {
  if (archives) {
    setArchivesState(sortArchives(archives));
  }
}, [archives]);


  useEffect(() => {
    const totalPages = Math.ceil((archivesState?.length || 0) / pageSize) || 1;
    setCurrentPage((p) => Math.min(Math.max(1, p), totalPages));
  }, [archivesState]);

  useEffect(() => {
    let cancelled = false;

    const getEmailFromToken = (token) => {
      try {
        const payload = JSON.parse(atob(token.split(".")[1] || ""));
        return payload?.email || payload?.sub || "";
      } catch {
        return "";
      }
    };

    const loadNickname = async () => {
      if (!isLoggedIn) {
        setNickname("");
        return;
      }

      const emailFromToken = getEmailFromToken(accessToken);
      const myEmail =
        emailFromToken ||
        localStorage.getItem("email") ||
        sessionStorage.getItem("email") ||
        "";

      try {
        const data = await userGetApi(accessToken);

        let me = data;
        if (Array.isArray(data)) {
          me = myEmail ? data.find((u) => u?.email === myEmail) : data[0];
        }

        const nk = me?.nickname ?? me?.user?.nickname ?? me?.profile?.nickname ?? "";

        if (!cancelled) {
          setNickname(nk);
          if (localStorage.getItem("accessToken")) {
            localStorage.setItem("nickname", nk);
          } else {
            sessionStorage.setItem("nickname", nk);
          }
        }
      } catch (err) {
        console.error("유저 정보 불러오기 실패:", err);
      }
    };

    loadNickname();
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, accessToken]);

  const confirmRepresentative = async () => {
    if (!repTarget?.constellationId) return;
    const id = repTarget.constellationId;

    try {
      await setRepresentative(id);

setArchivesState((prev) =>
  sortArchives(
    (prev || []).map((it) => ({
      ...it,
      isRepresentative: it.constellationId === id,
    }))
  )
);


      setSelected((prev) =>
        prev && prev.constellationId === id ? { ...prev, isRepresentative: true } : prev
      );

      setRepTarget(null);
      alert("대표 별자리가 설정되었습니다.");
    } catch (e) {
      console.error(e);
      alert("대표 별자리 설정에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  const handleBurgerClick = () => setIsOpen(true);

  const totalPages = Math.ceil((archivesState?.length || 0) / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const currentItems = archivesState?.slice(startIndex, startIndex + pageSize) || [];

  return (
   <div className="flex flex-col min-h-screen overflow-hidden text-white">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      {isOpen && (
        <div className="fixed inset-0 z-40" aria-hidden="true" onClick={() => setIsOpen(false)} />
      )}

      <div className="flex flex-row justify-between">
        <button className="ml-[1.81rem] mt-[2.13rem]" onClick={handleBurgerClick} aria-label="open sidebar">
          <CiMenuBurger size={30} />
        </button>
      </div>

      <div className="flex flex-col items-center">
        <span className="font-julius mt-5 text-7xl">STARLET ARCHIVE</span>
        {nickname && (
  <span className="mt-4 text-2xl text-center">
    <span className="font-bold">{nickname}</span>
    님의 별자리를 확인해보세요
  </span>
)}

      </div>

      <div className="p-12 pl-32 ">
        {loading && <div className="text-white/80">불러오는 중…</div>}
        {error && <div className="text-red-300">데이터를 불러오지 못했어요. 잠시 후 다시 시도해주세요.</div>}
        {!loading && !error && (!archivesState || archivesState.length === 0) && (
          <div className="text-white/70">아카이브가 비어 있어요.</div>
        )}

        {!!archivesState && archivesState.length > 0 && (
          <div className="grid gap-16 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-2">
            {currentItems.map((item, i) => (
              <StarArchiveCard
                key={item.constellationId}
                item={item}
                onOpen={() => {
                  setSelected(item);
                  setSelectedIndex(startIndex + i); // 전체 목록 기준 인덱스
                }}
                onStarClick={(e) => {
                  e.stopPropagation();
                  setRepTarget(item);
                }}
              />
            ))}
          </div>
        )}
      </div>

     {!!archivesState && archivesState.length > 0 && (
  <div className="flex justify-center items-center text-2xl select-none mb-8 mt-auto">
    <button
      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
      disabled={currentPage === 1}
      className={`mx-4 ${
        currentPage === 1 ? "opacity-50" : "hover:text-blue-300"
      }`}
    >
      {"<"}
    </button>
    <span>
      {currentPage} / {totalPages}
    </span>
    <button
      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
      disabled={currentPage === totalPages}
      className={`mx-4 ${
        currentPage === totalPages ? "opacity-50" : "hover:text-blue-300"
      }`}
    >
      {">"}
    </button>
  </div>
)}


    <ConstellationDetailModal
  open={openDetail}
  onClose={() => setSelected(null)}
  initial={selected}
  detail={selectedId === detail?.constellationId ? detail : null}  
  items={archivesState || []}
  index={selectedIndex ?? 0}
  onChangeIndex={(i) => {
    setSelectedIndex(i);
    setSelected(archivesState[i]); 
  }}
  loop={true}
/>

      <RepresentativeConfirmModal
        open={openRepModal}
        onClose={() => setRepTarget(null)}
        onConfirm={confirmRepresentative}
        item={repTarget}
      />
    </div>
  );
};

export default StarArchive;
