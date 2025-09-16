import React, { useState } from "react";
import StarSkyDate from "../components/StarSkyDate";
import ConstellationModal from "../components/ConstellationModal";

const StarSky = () => {
  const [{ year, pair }, setCal] = useState({ year: 2025, pair: 0 });
  const [open, setOpen] = useState(false);
  const [constellation, setConstellation] = useState({ name: "", desc: "" });

  const handlePrev = () => {
    setCal(({ year, pair }) =>
      pair === 0 ? { year: year - 1, pair: 5 } : { year, pair: pair - 1 }
    );
  };
  const handleNext = () => {
    setCal(({ year, pair }) =>
      pair === 5 ? { year: year + 1, pair: 0 } : { year, pair: pair + 1 }
    );
  };

  const handleGenerate = () => setOpen(true);

  const handleSubmit = (data) => {
    setConstellation(data);
    setOpen(false);

    console.log("Saved:", data);
  };

  return (
    <div className="min-h-screen relative text-white">
      <button
        onClick={handleGenerate}
        className="absolute top-3 right-3 px-4 py-2 text-white text-[20px] font-normal"
      >
        Generate
      </button>

      <div className="h-[70vh] flex items-center justify-center">
        <div className="text-center">
          {constellation.name && (
            <p className="mt-2 text-white/80">
              최근 저장: <b>{constellation.name}</b>
            </p>
          )}
        </div>
      </div>

      <StarSkyDate
        year={year}
        monthPairIndex={pair}
        onPrev={handlePrev}
        onNext={handleNext}
      />

      <ConstellationModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        initial={constellation}
      />
    </div>
  );
};

export default StarSky;
