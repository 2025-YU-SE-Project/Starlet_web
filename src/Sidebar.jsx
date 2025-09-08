import menuIcon from "./assets/menu.png";
import { Link } from "react-router-dom";

const Sidebar = ({ isOpen, setIsOpen, showAuthLinks = true }) => {
  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {!isOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 focus:outline-none"
        >
          <img
            src={menuIcon}
            alt="menu"
            className="w-8 h-8 cursor-pointer transition hover:opacity-70"
          />
        </button>
      )}

      {showAuthLinks && (
        <div className="fixed top-4 right-6 z-50 flex space-x-4 text-white text-sm md:text-lg font-medium">
          <Link
            to="/login"
            className="hover:underline transition cursor-pointer"
          >
            로그인
          </Link>
          <Link
            to="/signup"
            className="hover:underline transition cursor-pointer"
          >
            회원가입
          </Link>
        </div>
      )}

      <div
        className={`fixed top-0 left-0 h-full max-w-[70vw] sm:w-72 text-white shadow-md ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 z-40 bg-black/40 backdrop-blur-sm rounded-r-2xl`}
      >
        <div className="relative mt-10 px-6">
          <div className="flex items-start gap-3 mb-2">
            <div className="w-12 h-12 bg-gray-400 rounded-full flex-shrink-0"></div>
            <div className="flex flex-col">
              <p className="text-lg font-semibold">미등록 사용자</p>
              <p className="text-xs text-gray-300 mt-1">
                로그인 후 이용해주세요!
              </p>
            </div>
          </div>
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-transparent z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
