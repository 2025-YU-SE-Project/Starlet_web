import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AuthContext from "../contexts/AuthContext";
import userGetApi from "../apis/userGetApi";
import logoutApi from "../apis/logoutApi";
import getLevelApi from "../apis/getLevelApi";
import img4 from "./../assets/home/img4.png";
import img9 from "./../assets/home/img9.png";
import img5 from "./../assets/home/img5.png";
import img6 from "./../assets/home/img6.png";
import img7 from "./../assets/home/img7.png";
import img8 from "./../assets/home/img8.png";
import myPageUserApi from "../apis/myPageUserApi";
import profileImg from "../assets/MyPage/profile.png";

const Sidebar = ({ isOpen, setIsOpen }) => {

  const renderLevelName = (name) => {
    if (!name || typeof name !== "string") return "";

    const parts = name.trim().split(/\s+/);

    const suffix = parts.length > 1 ? parts[parts.length - 1] : "";
    const prefix =
      parts.length > 1 ? parts.slice(0, -1).join(" ") : parts[0];

    return (
      <>
        <span className="text-[#FFFFFF]">{prefix}</span>{" "}
        <span className="text-[#FFFFFF]/70">{suffix}</span>
      </>
    );
  };

  const getProfileSrc = (url) => {
    if (!url) return profileImg;

    if (url.includes("default") || url.includes("basic") || url.trim() === "") {
      return profileImg;
    }
    return url;
  };

  const navigate = useNavigate();
  const { accessToken, logout } = useContext(AuthContext);
  const { t } = useTranslation();

  const [levelName, setLevelName] = useState("");
  const [levelMin, setLevelMin] = useState(0);
  const [levelMax, setLevelMax] = useState(0);
  const [progress, setProgress] = useState(0);
  const [profileUrl, setProfileUrl] = useState("");
  const [nickname, setNickname] = useState("user");
  const [defaultUserImg, setDefaultUserImg] = useState(false); 

  const isLoggedIn = !!accessToken;

  useEffect(() => {
    let cancelled = false;

    const loadUserData = async () => {
      if (!isLoggedIn) {
        setNickname("미등록사용자");
        setProfileUrl("");
        setLevelName("");
        setLevelMin(0);
        setLevelMax(0);
        setProgress(0);
        return;
      }

      const cached =
        localStorage.getItem("nickname") || sessionStorage.getItem("nickname");
      if (cached && !cancelled) setNickname(cached);

      try {
        const [users, levelData, myPage] = await Promise.all([
          userGetApi(accessToken),
          getLevelApi(accessToken),
          myPageUserApi(accessToken),
        ]);

        const myEmail =
          localStorage.getItem("email") || sessionStorage.getItem("email");
        let nk = "user";

        if (myEmail && Array.isArray(users)) {
          const me = users.find((u) => u.email === myEmail);
          if (me?.nickname) nk = me.nickname;
        }

        if (!cancelled) {
          setNickname(nk);
          setProfileUrl(myPage?.profilePhotoUrl || "");

          if (localStorage.getItem("accessToken")) {
            localStorage.setItem("nickname", nk);
          } else {
            sessionStorage.setItem("nickname", nk);
          }
        }

        if (!cancelled && levelData) {
          const { name, min, max, progressToNext } = levelData;

          setLevelName(name || "");
          setLevelMin(typeof min === "number" ? min : 0);
          setLevelMax(typeof max === "number" ? max : 0);

          const range = Math.max(1, (max ?? 0) - (min ?? 0));
          const current = (max ?? 0) - (progressToNext ?? 0);
          const percent = Math.round(
            Math.min(100, Math.max(0, ((current - (min ?? 0)) / range) * 100))
          );
          setProgress(percent);
        }
      } catch (err) {
        console.error("유저/레벨 정보 불러오기 실패:", err);

        if (err?.response?.status === 401 || err?.response?.status === 403) {
          logout();
          return;
        }

        if (!cancelled) {
          const fallback =
            localStorage.getItem("nickname") ||
            sessionStorage.getItem("nickname") ||
            "사용자";
          setNickname(fallback);
          setProfileUrl("");
        }
      }
    };

    loadUserData();
    return () => {
      cancelled = true;
    };
  }, [accessToken, isLoggedIn, logout]);

  const handleLogout = async () => {
    try {
      await logoutApi(accessToken);
    } catch (err) {
      console.error("로그아웃 실패:", err);
    } finally {
      logout();
      setIsOpen(false);
      navigate("/");
    }
  };

  const closeAnd = (fn) => () => {
    if (typeof fn === "function") fn();
    setIsOpen(false);
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        role="dialog"
        aria-modal="true"
        className={`fixed top-0 left-0 h-screen w-[280px] bg-black/40 backdrop-blur-md text-white transition-transform duration-300
                    ${
                      isOpen ? "translate-x-0" : "-translate-x-full"
                    } rounded-[24px] z-50`}
        aria-hidden={!isOpen}
      >
        <div className="flex flex-col h-full p-5">
          <div>
            <div className="flex  gap-3 mt-2">
    
              <div className="flex flex-col">
                      <div className="flex flex-row items-center gap-3 mb-8">
                  <img src={img4} className="w-13 h-13" />
                  <span className="text-[30px] font-extrabold">
                    STARLET
                  </span>
                  </div>
                    <div className="flex flex-row gap-4">
                  {isLoggedIn && (
  <div className="w-20 h-20 rounded-full overflow-hidden bg-[#D9D9D9]">
    <img
      src={getProfileSrc(profileUrl)}
      alt="프로필"
      className={`w-full h-full object-cover object-center block transition-transform duration-200 ${
        getProfileSrc(profileUrl) === profileImg ? "scale-105" : ""
      }`}
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = profileImg;
      }}
      onLoad={(e) => {
        const isDef = e.currentTarget.src.includes("profile");
        setDefaultUserImg(isDef);
      }}
      style={defaultUserImg ? { transform: "scale(1.08)" } : {}}
    />
  </div>
)}



                <div className="flex flex-col justify-center">
               
            <span className="font-pretendard font-semibold text-[16px]">
  {isLoggedIn
    ? renderLevelName(levelName || "마스터")
    : ""}
</span>
          <div className="flex flex-row gap-1 font-bold items-center text-[20px]">
                <span>
                  {isLoggedIn && nickname}
                </span>
               {isLoggedIn && (
  <span className="text-[#FFFFFF]/70">님</span>
)}
        </div>
</div>
</div>
              </div>
            </div>

          {isLoggedIn && (
  <div className="mt-4">
    <div className="w-full h-5 bg-gray-400/60 overflow-hidden rounded-[15px]">
      <div
        className="h-full bg-green-500"
        style={{
          width: `${Math.min(100, Math.max(0, progress))}%`,
        }}
      />
    </div>

  </div>
)}


          {isLoggedIn && <hr className="my-4 border-white" />}

        
            <nav className="flex flex-col gap-4 font-pretendard">
              {isLoggedIn ? (
               
                <>
                <span className="font-bold text-[24px]">MENU</span>
                <div className="flex flex-row items-center gap-2 text-[20px] ">
                  <img className='w-10 h-10'src={img9}/>
                  <Link
                    to="/"
                    onClick={closeAnd()}
                    aria-label={t("navbar.home")}
                  >
                    {t("navbar.home")}
                  </Link>
                  </div>
                  <div className="flex flex-row items-center gap-2 text-[20px]">
                    <img className='w-10 h-10' src={img5}/>
                  <Link
                    to="/starsky"
                    onClick={closeAnd()}
                    aria-label={t("navbar.NightSkyPage")}
                  >
                    {t("navbar.NightSkyPage")}
                  </Link>
                  </div>
                  <div className="flex flex-row items-center gap-2 text-[20px]">
                    <img className='w-10 h-10' src={img6}/>
                  <Link
                    to="/calendar"
                    onClick={closeAnd()}
                    aria-label={t("navbar.MyDiary")}
                  >
                    {t("navbar.MyDiary")}
                  </Link>
                  </div>
                  <div className="flex flex-row items-center gap-2 text-[20px]">
                    <img className='w-10 h-10' src={img7}/>
                  <Link
                    to="/archive"
                    onClick={closeAnd()}
                    aria-label={t("navbar.ConstellationArchive")}
                  >
                    {t("navbar.ConstellationArchive")}
                  </Link>
                  </div>
                  <div className="flex flex-row items-center gap-2 text-[20px]">
                    <img className='w-10 h-10' src={img8}/>
                  <Link
                    to="/mypage"
                    onClick={closeAnd()}
                    aria-label={t("navbar.MyPage")}
                  >
                    {t("navbar.MyPage")}
                  </Link>
                  </div>
                </>
              ) : null}
            </nav>
          </div>

          {isLoggedIn && (
            <button
              className="mt-auto text-left mb-2 text-[20px] cursor-pointer font-pretendard"
              onClick={handleLogout}
              aria-label={t("navbar.Logout")}
            >
              {t("navbar.Logout")}
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
