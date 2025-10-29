import React from "react";
import { IoIosStar } from "react-icons/io";
import ConstellationMini from "../ConstellationMini";

export default function StarArchiveCard({ item, onStarClick }) {
  const date = new Date(item.date);
  const dateStr =
    `${date.getFullYear()}.` +
    `${String(date.getMonth() + 1).padStart(2, "0")}.` +
    `${String(date.getDate()).padStart(2, "0")}`;

  return (
    <div
      className="relative flex flex-row text-white border w-[600px] h-[250px]
                 bg-white/10 border-white/10 rounded-[15px] cursor-pointer"
    >
      <div className="ml-5 my-4 rounded-[12px]">
        <ConstellationMini
          stars={item.stars}
          connections={item.connections || []}
          width={230}
          height={220}
        />
      </div>

      <div className="flex flex-col px-5 w-full">
        <div className="text-sm text-white/70 mt-18">{dateStr}</div>
        <div className="text-2xl font-semibold">{item.name}</div>
        <div className="text-white mt-4">{item.description}</div>
      </div>

      <div className="absolute right-3 top-3 ">
        <button
          aria-label={item.isRepresentative ? "대표 별자리" : "대표로 지정"}
          onClick={(e) => {
            e.stopPropagation();
            onStarClick && onStarClick(e);
          }}
          className="p-1"
        >
          <IoIosStar
            size={38}
            className={item.isRepresentative ? "cursor-pointer text-[#FFD12B]" : "text-white/30 cursor-pointer"}
          />
        </button>
      </div>
    </div>
  );
}
