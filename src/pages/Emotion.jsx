import React from "react";
import backgroundImage from "../assets/background.png";

const Emotion = () => {
  return (
    <div
      className="w-full h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="bg-white w-[90%] h-[80%] rounded-2xl shadow-2xl p-22 relative">
        <h1 className="text-6xl font-bold text-gray-500 text-left">
          오늘의 감정은?
        </h1>
        <hr className="my-8 text-gray-500 border-t-2" />
      </div>
    </div>
  );
};

export default Emotion;
