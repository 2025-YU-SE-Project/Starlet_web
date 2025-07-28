import { useState } from "react";
import { Link } from "react-router-dom";
import menuIcon from "./assets/menu.png";

const Sidebar = ({ showAuthLinks = true, rightContent = null }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      <nav className="fixed top-4 left-0 w-full h-10 flex justify-between items-center px-6 bg-transparent z-50">
        <button
          onClick={toggleSidebar}
          className="focus:outline-none relative z-[101]"
        >
          <img
            src={menuIcon}
            alt="menu"
            className="w-7 h-7 object-contain cursor-pointer hover:opacity-80 transition"
          />
        </button>

        <div className="flex items-center space-x-6 text-white text-lg font-medium relative z-[101]">
          {showAuthLinks && !rightContent && (
            <>
              <Link to="/login" className="hover:underline">
                로그인
              </Link>
              <Link to="/signup" className="hover:underline">
                회원가입
              </Link>
            </>
          )}
          {rightContent}
        </div>
      </nav>

      <div
        className={`fixed top-0 left-0 h-full w-72 bg-gray-900/95 text-white shadow-lg transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 z-[200]`}
      >
        <div className="relative bg-[#1a2b4c] h-16 flex items-center justify-center">
          <button
            onClick={toggleSidebar}
            className="absolute left-4 text-2xl text-white cursor-pointer"
          >
            ✕
          </button>
          <h1 className="text-xl font-bold">STARLET</h1>
        </div>

        <div className="flex flex-col items-center mt-6 space-y-2 px-4">
          <div className="w-16 h-16 bg-gray-600 rounded-full"></div>
          <p className="text-lg font-bold">미등록 사용자</p>
          <p className="text-sm text-gray-300 mb-4">로그인 후 이용해주세요!</p>

          <div className="flex flex-col space-y-3 w-32">
            <Link
              to="/login"
              className="border border-white text-center py-2 rounded hover:bg-white hover:text-black transition"
            >
              로그인
            </Link>
            <Link
              to="/signup"
              className="border border-white text-center py-2 rounded hover:bg-white hover:text-black transition"
            >
              회원가입
            </Link>
          </div>
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[150]"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Sidebar;
