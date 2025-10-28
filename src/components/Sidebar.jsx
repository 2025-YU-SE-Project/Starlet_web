import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../contexts/AuthContext";
import userGetApi from "../apis/userGetApi";
import logoutApi from "../apis/logoutApi";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();

  const { accessToken, logout } = useContext(AuthContext);

  const [nickname, setNickname] = useState("user");
  const [progress] = useState(34); // 진행도 -> 더미데이터
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
    <aside
      className={`fixed top-0 left-0 h-screen w-[280px] bg-black/40 backdrop-blur-md text-white transition-transform duration-300
                  ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                  } rounded-[24px] z-50`}
      aria-hidden={!isOpen}
    >
      <div className="flex flex-col h-full  p-5">
        {/* 프로필 */}
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

          {/* 레벨 */}
          {isLoggedIn && (
            <div className="mt-4">
              <div className="w-full h-5 bg-gray-400/60 overflow-hidden">
                <div
                  className="h-full bg-green-500"
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
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
                <Link to="/" onClick={closeAnd()} aria-label="Home">
                  Home
                </Link>
                <Link
                  to="/starsky"
                  onClick={closeAnd()}
                  aria-label="My Constellation"
                >
                  Night Sky Page
                </Link>
                <Link
                  to="/calendar"
                  onClick={closeAnd()}
                  aria-label="Star Calendar"
                >
                  My Diary
                </Link>
                <Link
                  to="/archive"
                  onClick={closeAnd()}
                  aria-label="Constellation Repo"
                >
                  Constellation Archive
                </Link>
                <Link to="/mypage" onClick={closeAnd()} aria-label="My Page">
                  My Page
                </Link>
              </>
            ) : (
              <></>
            )}
          </nav>
        </div>

        {isLoggedIn && (
          <button
            className="mt-auto text-left  mb-2 text-xl"
            onClick={handleLogout}
          >
            LOGOUT
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
