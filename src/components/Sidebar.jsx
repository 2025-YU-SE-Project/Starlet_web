// src/components/Sidebar.jsx
import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AuthContext from "../contexts/AuthContext";
import userGetApi from "../apis/userGetApi";
import logoutApi from "../apis/logoutApi";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const { accessToken, logout } = useContext(AuthContext);
  const { t } = useTranslation();

  const [nickname, setNickname] = useState("user");
  const [progress] = useState(34);
  const isLoggedIn = !!accessToken;

  useEffect(() => {
    let cancelled = false;

    const loadNickname = async () => {
      if (!isLoggedIn) {
        setNickname("미등록사용자");
        return;
      }

      const cached =
        localStorage.getItem("nickname") || sessionStorage.getItem("nickname");
      if (cached && !cancelled) setNickname(cached);

      try {
        const users = await userGetApi(accessToken);
        const myEmail =
          localStorage.getItem("email") || sessionStorage.getItem("email");
        let nk = "user";

        if (myEmail && Array.isArray(users)) {
          const me = users.find((u) => u.email === myEmail);
          if (me?.nickname) nk = me.nickname;
        }

        if (!cancelled) {
          setNickname(nk);
          if (localStorage.getItem("accessToken")) {
            localStorage.setItem("nickname", nk);
          } else {
            sessionStorage.setItem("nickname", nk);
          }
        }
      } catch (err) {
        console.error("닉네임 불러오기 실패:", err);

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
        }
      }
    };

    loadNickname();
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
            <div className="flex items-center gap-3 mt-2">
              <div className="w-12 h-12 rounded-full bg-gray-300" />
              <div className="flex flex-col">
                <span className="text-2xl">
                  {isLoggedIn ? nickname : "미등록사용자"}
                </span>
                <span className="text-sm text-gray-300">
                  {isLoggedIn ? "마스터" : "로그인 후 이용해주세요!"}
                </span>
              </div>
            </div>

            {isLoggedIn && (
              <div className="mt-4">
                <div className="w-full h-5 bg-gray-400/60 overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{
                      width: `${Math.min(100, Math.max(0, progress))}%`,
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-300 mt-1">
                  <span>0</span>
                  <span>100</span>
                </div>
              </div>
            )}

            <hr className="my-4 border-white/40" />

            <nav className="flex flex-col gap-6 text-xl">
              {isLoggedIn ? (
                <>
                  <Link
                    to="/"
                    onClick={closeAnd()}
                    aria-label={t("navbar.home")}
                  >
                    {t("navbar.home")}
                  </Link>
                  <Link
                    to="/starsky"
                    onClick={closeAnd()}
                    aria-label={t("navbar.NightSkyPage")}
                  >
                    {t("navbar.NightSkyPage")}
                  </Link>
                  <Link
                    to="/calendar"
                    onClick={closeAnd()}
                    aria-label={t("navbar.MyDiary")}
                  >
                    {t("navbar.MyDiary")}
                  </Link>
                  <Link
                    to="/archive"
                    onClick={closeAnd()}
                    aria-label={t("navbar.ConstellationArchive")}
                  >
                    {t("navbar.ConstellationArchive")}
                  </Link>
                  <Link
                    to="/mypage"
                    onClick={closeAnd()}
                    aria-label={t("navbar.MyPage")}
                  >
                    {t("navbar.MyPage")}
                  </Link>
                </>
              ) : null}
            </nav>
          </div>

          {isLoggedIn && (
            <button
              className="mt-auto text-left mb-2 text-xl cursor-pointer"
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
