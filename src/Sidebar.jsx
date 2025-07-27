import { useState } from "react";
import { Link } from "react-router-dom";
import menuIcon from "./assets/menu.png";

//로그인 안 한 버전!!!

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* 상단 Navbar */}
      <nav className="absolute top-0 right-0 w-full flex justify-between items-center px-6 py-4 bg-transparent z-50">
        {/* 카테고리 버튼 */}
        <button onClick={toggleSidebar} className="focus:outline-none">
          <img
            src={menuIcon}
            alt="menu"
            className="w-7 h-7 cursor-pointer hover:opacity-80 transition"
          />
        </button>

        {/* 상단 로그인/회원가입 */}
        <div className="flex space-x-6 text-white text-lg font-medium">
          <Link to="/login" className="hover:underline">
            로그인
          </Link>
          <Link to="/signup" className="hover:underline">
            회원가입
          </Link>
        </div>
      </nav>

      {/* 사이드바 */}
      <div
        className={`fixed top-0 left-0 h-full w-75 bg-gray-900/95 text-white shadow-lg transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 z-50`}
      >
        {/* 헤더 */}
        <div className="relative bg-[#1a2b4c] h-16 flex items-center justify-center">
          {/* X 버튼 */}
          <button
            onClick={toggleSidebar}
            className="absolute left-5 text-2xl text-white cursor-pointer hover:opacity-80"
          >
            ✕
          </button>
          <h1 className="text-xl font-bold">별담</h1>
        </div>

        <div className="flex flex-col items-center mt-8 space-y-4">
          {/* 프로필 아이콘 */}
          <div className="w-16 h-16 bg-gray-600 rounded-full"></div>
          <p className="text-lg font-semibold">미등록 사용자</p>
          <p className="text-sm text-gray-300 mb-8">로그인 후 이용해주세요!</p>

          {/* 로그인, 회원가입 버튼 */}
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

      {/* 오버레이 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Sidebar;
