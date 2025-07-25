import React, { useState } from "react";
import backgroundImage from "../assets/background.png";
import smile from "../assets/smile.png";

const emotions = [
  { title: "웃겨요", subtitle: "유쾌한 일이 가득했어요~" },
  { title: "놀라워요", subtitle: "예상 못한 일이 많았어요!" },
  {
    title: "잘 모르겠어요",
    subtitle: "감정이 복잡하고 알 수 없는 하루였어요..",
  },
  { title: "화나요", subtitle: "짜증나고 속상한 일이 많았어요.." },
  { title: "행복해요", subtitle: "아주 기분이 좋은 하루였어요!" },
  { title: "슬퍼요", subtitle: "눈물 날 거 같은 하루였어요.." },
];

const Emotion = () => {
  const [selected, setSelected] = useState(null);

  return (
    <div
      className="w-full h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="bg-white w-[90%] h-[750px] rounded-2xl p-24 mt-10 relative overflow-auto">
        <button className="absolute top-7 right-7 text-2xl text-black transition hover:scale-90">
          완료
        </button>

        <h1 className="text-6xl font-bold text-gray-500">오늘의 감정은?</h1>
        <hr className="my-8 text-gray-500 border-t-2" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 p-12">
          {" "}
          {/* 모바일에서는 1열로 나타나고 태블릿 이상 크기에서는 2열로 나타남 */}
          {emotions.map(({ title, subtitle }) => (
            <EmotionButton
              key={title}
              img={smile}
              title={title}
              subtitle={subtitle}
              isSelected={selected === title}
              onClick={() => setSelected(title)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const EmotionButton = ({ img, title, subtitle, isSelected, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center border-2 space-x-4 p-4 rounded-xl transition text-left
      ${
        isSelected
          ? "bg-black/20 border-2 border-black"
          : "bg-white hover:bg-gray-200"
      }`}
  >
    {/* 감정 선택 시 호버 */}
    <img src={img} alt={title} className="w-16 h-16" />
    <div>
      <div className="text-xl font-bold text-black">{title}</div>
      <div className="text-gray-400">{subtitle}</div>
    </div>
  </button>
);

export default Emotion;
