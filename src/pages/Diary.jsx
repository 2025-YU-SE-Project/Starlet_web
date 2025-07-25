import React from "react";
import backgroundImage from "../assets/background.png";

const Diary = () => {
  return (
    <div
      className="w-full h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="bg-white w-[90%] h-[80%] rounded-2xl p-24 relative overflow-auto">
        <button className="absolute top-5 right-5 text-2xl text-black transition hover:scale-90">
          완료
        </button>
        <div className="flex flex-col gap-5">
          <h1 className="text-6xl font-bold text-black">JULY 2025</h1>
          <h1 className="text-4xl text-gray-400">07/12 Mins의 일기장</h1>
        </div>
        <hr className="my-4 text-gray-500 border-t-2" />
        <div className="w-full flex justify-end mt-6">
          <textarea
            type="text"
            placeholder="일기를 입력해보세요!"
            className="bg-gray-100 w-[600px] h-[380px] rounded-2xl p-4 text-black text-lg shadow-md focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
      </div>
    </div>
  );
};

export default Diary;
