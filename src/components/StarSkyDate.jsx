import React from "react";

const MONTH_ABBR = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

const StarSkyDate = ({ year, monthPairIndex, onPrev, onNext }) => {
  const firstMonth = monthPairIndex * 2;
  const secondMonth = firstMonth + 1;

  return (
    <div
      className="
        fixed bottom-6 left-1/2 -translate-x-1/2 z-50
        bg-black/40 backdrop-blur
        px-6 py-2 flex items-center gap-6 select-none
      "
      aria-label="Month navigation"
    >
      <button
        type="button"
        onClick={onPrev}
        className="text-white text-2xl leading-none hover:opacity-80 focus:outline-none"
        aria-label="Previous months"
      >
        &lt;
      </button>

      <div className="text-white text-[20px] font-julius tracking-wider flex gap-2">
        <span>{year}</span>
        <span>{MONTH_ABBR[firstMonth]}</span>
        <span>/</span>
        <span>{MONTH_ABBR[secondMonth]}</span>
      </div>

      <button
        type="button"
        onClick={onNext}
        className="text-white text-2xl leading-none hover:opacity-80 focus:outline-none"
        aria-label="Next months"
      >
        &gt;
      </button>
    </div>
  );
};

export default StarSkyDate;
