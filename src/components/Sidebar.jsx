import menuIcon from "../assets/menu.png";
import { Link } from "react-router-dom";

const Sidebar = ({ isOpen, setIsOpen, showAuthLinks = true }) => {
  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {!isOpen && (
        <button onClick={toggleSidebar} className="fixed top-4 left-4 z-50 ">
          <img
            src={menuIcon}
            className="w-8 h-8 cursor-pointer transition hover:opacity-70"
          />
        </button>
      )}

      {showAuthLinks && (
        <div className="fixed top-4 right-6 z-50 flex space-x-4 text-white text-[20px]">
          <Link to="/signin" className="hover:underline cursor-pointer">
            로그인
          </Link>
          <Link to="/signup" className="hover:underline cursor-pointer">
            회원가입
          </Link>
        </div>
      )}

      <div
        className={`
          fixed inset-y-0 left-0 z-50
          w-[70vw] max-w-[288px]
          transform-gpu origin-left transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div
          className={`
            h-full w-full text-white
            bg-[#1B1F26]/72
            rounded-r-[35px]
            transition-opacity duration-300 
            ${isOpen ? "opacity-100" : "opacity-0"}
          `}
        >
          <div className="px-6 pt-10 pb-6 h-full overflow-y-auto">
            <div className="flex items-start gap-3">
              <div className="w-[60px] h-[60px] bg-[#D9D9D9] rounded-full flex-shrink-0" />
              <div className="flex flex-col pl-1">
                <span className="text-[23px]">미등록 사용자</span>
                <span className="text-[12px] text-white mt-1">
                  로그인 후 이용해주세요!
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-transparent"
          onMouseDown={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
