import React from "react";
import backgroundImage from "../assets/background.png";

const Calender = () => {
  return (
    <div
      className="w-full h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="pt-15 text-center">
        <h1
          className="text-white text-5xl"
          style={{ fontFamily: "'Julius Sans One', sans-serif" }}
        >
          STAR CALENDER
        </h1>
        <div className="flex flex-row space-x-4 justify-center p-5">
          <button className="text-white text-2xl transition hover:scale-90">
            〈
          </button>
          <h1
            className="text-white text-2xl"
            style={{ fontFamily: "'Julius Sans One', sans-serif" }}
          >
            2025 July
          </h1>
          <button className="text-white text-2xl transition hover:scale-90">
            〉
          </button>
        </div>
      </div>
    </div>
  );
};

export default Calender;
