import React, { useState } from "react";
import backgroundImage from "../assets/background.png";

const Diary = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div
      className="w-full h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="bg-white w-[90%] h-[750px] rounded-2xl p-24 mt-10 relative overflow-auto">
        <button
          className="absolute top-7 right-7 text-2xl text-black transition hover:scale-90"
          onClick={() => setIsModalOpen(true)} // 클릭시 모달 열림
        >
          완료
        </button>

        <div className="flex flex-col gap-5">
          <h1 className="text-6xl font-bold text-black">JULY 2025</h1>
          <h1 className="text-4xl text-gray-400">07/12 Mins의 일기장</h1>
        </div>

        <hr className="my-4 text-gray-500 border-t-2" />

        <div className="w-full flex justify-end mt-6">
          <textarea
            placeholder="일기를 입력해보세요!"
            className="bg-gray-100 w-[600px] h-[480px] rounded-2xl p-4 text-black text-lg shadow-md focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black opacity-10"></div>

            <div className="relative bg-white rounded-xl p-8 w-[400px] max-w-full text-center shadow-lg">
              <button
                className="absolute top-2 right-4 text-xl text-gray-500  hover:scale-90 transition"
                onClick={() => setIsModalOpen(false)}
              >
                X
              </button>
              <h2 className="text-2xl font-bold mb-4">알림</h2>
              <p className="mb-6">
                별이 생성되었습니다. 밤하늘로 이동하시겠습니까?
              </p>
              <div className="space-x-3">
                <button
                  className="px-6 py-2 bg-[#3E33DB] text-white rounded-lg hover:scale-95 transition"
                  onClick={() => setIsModalOpen(true)}
                >
                  이동
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Diary;
