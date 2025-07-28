import { useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../Sidebar";
import wallpaper from "../assets/background.png";

const Mycons = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div
      className="w-full h-screen bg-center bg-cover text-white relative"
      style={{ backgroundImage: `url(${wallpaper})` }}
    >
      <Sidebar
        showAuthLinks={false}
        rightContent={
          <span
            onClick={() => setIsModalOpen(true)}
            className="cursor-pointer text-white text-lg hover:underline transition"
          >
            Generate
          </span>
        }
      />

      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[101] leading-none">
        <Link
          to="/"
          className="text-2xl md:text-3xl font-bold text-white hover:text-gray-300 transition font-[Julius Sans One]"
        >
          STARLET
        </Link>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[150] flex items-center justify-center px-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white/95 text-black rounded-xl shadow-xl w-[750px] max-w-[95%] h-[480px] flex flex-col md:flex-row gap-6 p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black text-2xl cursor-pointer"
            >
              ✕
            </button>

            <div className="w-[50%] h-[350px] flex items-center justify-center bg-gray-100 rounded-lg border self-center">
              <p className="text-gray-400">별자리 미리보기</p>
            </div>

            <div className="flex-1 flex flex-col justify-center space-y-4">
              <h2 className="text-lg font-semibold">
                별자리 정보를 입력해주세요
              </h2>
              <input
                type="text"
                placeholder="별자리 이름"
                className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-300 bg-white/70 w-full"
              />
              <input
                type="text"
                placeholder="별자리 소개"
                className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-300 bg-white/70 w-full"
              />
              <button className="bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-800 transition cursor-pointer w-full">
                별자리 생성
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mycons;
