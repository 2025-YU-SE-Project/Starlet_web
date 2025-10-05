import React, { useContext, useEffect, useState } from "react";
import { CiMenuBurger } from "react-icons/ci";
import Sidebar from "../components/Sidebar";
import AuthContext from "../contexts/AuthContext";
import userGetApi from "../apis/userGetApi";
import StarArchiveCard from "../components/ArchiveCard/StarArchiveCard";
import { useConstellationArchive } from "../hooks/useConstellationArchive";


import ConstellationDetailModal from "../components/ArchiveCard/ConstellationDetailModal";
import { useConstellationDetail } from "../hooks/useConstellationDetail";

const StarArchive = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { accessToken } = useContext(AuthContext);
  const isLoggedIn = !!accessToken;

  const [nickname, setNickname] = useState("");


  const { data: archives, loading, error } = useConstellationArchive();


  const [selected, setSelected] = useState(null); 
  const open = !!selected;
  const selectedId = selected?.constellationId;


  const { data: detail } = useConstellationDetail(selectedId, open);

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

        const nk =
          me?.nickname ??
          me?.user?.nickname ??
          me?.profile?.nickname ??
          "";

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

  return (
    <div className="text-white">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          aria-hidden="true"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className="flex flex-row justify-between">
        <button
          className="ml-[1.81rem] mt-[2.13rem]"
          onClick={() => setIsOpen(true)}
          aria-label="open sidebar"
        >
          <CiMenuBurger size={30} />
        </button>
      </div>

      <div className="flex flex-col items-center">
        <span className="font-julius mt-16 text-7xl">STARLET ARCHIVE</span>
        {nickname && (
          <span className="mt-4 text-2xl text-center">
            {nickname}님의 별자리를 확인해보세요
          </span>
        )}
      </div>

      <div className="p-12 pl-32">
        {loading && <div className="text-white/80">불러오는 중…</div>}
        {error && (
          <div className="text-red-300">
            데이터를 불러오지 못했어요. 잠시 후 다시 시도해주세요.
          </div>
        )}
        {!loading && !error && (!archives || archives.length === 0) && (
          <div className="text-white/70">아카이브가 비어 있어요.</div>
        )}

        {!!archives && archives.length > 0 && (
          <div className="grid gap-16 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-2">
            {archives.map((item) => (
              <div
                key={item.constellationId}
                onClick={() => setSelected(item)}
              >
                <StarArchiveCard item={item} />
              </div>
            ))}
          </div>
        )}
      </div>


      <ConstellationDetailModal
        open={open}
        onClose={() => setSelected(null)}
        initial={selected}
        detail={detail}
      />
    </div>
  );
};

export default StarArchive;
