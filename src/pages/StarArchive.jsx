import React, { useContext, useEffect, useState } from "react";
import { CiMenuBurger } from "react-icons/ci";
import Sidebar from "../components/Sidebar";
import AuthContext from "../contexts/AuthContext";
import userGetApi from "../apis/userGetApi";

const StarArchive = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { accessToken } = useContext(AuthContext);
  const isLoggedIn = !!accessToken;

  const [nickname, setNickname] = useState("");

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
    </div>
  );
};

export default StarArchive;
