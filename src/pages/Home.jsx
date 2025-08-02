import { useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../Sidebar";
import background from "../assets/background.png";
import starIcon from "../assets/const.png";
import diaryIcon from "../assets/diary.png";
import archiveIcon from "../assets/archive.png";
import { AiFillStar } from "react-icons/ai";

const Home = () => {
  const [isOpen, setIsOpen] = useState(false);

  const [favorites, setFavorites] = useState({
    constellation: false,
    diary: false,
    archive: false,
  });

  const toggleFavorite = (key) => {
    setFavorites((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${background})` }}
      ></div>

      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div
        className={`relative z-10 transition-transform duration-300 ${
          isOpen ? "translate-x-50" : ""
        }`}
      >
        <div className="w-full flex flex-col pt-20 px-10 md:px-16 lg:px-24">
          <div className="max-w-3xl mb-16 ml-8 md:ml-20">
            <p className="text-sm md:text-base text-white mb-2">
              별 하나, 감정 하나
            </p>
            <h1
              className="text-6xl md:text-7xl text-white"
              style={{ fontFamily: "'Julius Sans One', sans-serif" }}
            >
              STARLET
            </h1>
            <p className="text-xl md:text-2xl mt-4 leading-relaxed text-white">
              "기억은 흘러가지 않아요.
              <br />
              <span className="block pl-16">
                오늘의 감정을 하늘에 남겨두세요."
              </span>
            </p>
          </div>
        </div>
      </div>

      <div
        className={`relative z-10 transition-transform duration-300 ${
          isOpen ? "translate-x-20" : ""
        }`}
      >
        <div className="relative z-10 flex justify-center gap-20 flex-wrap">
          <div className="relative">
            <button
              onClick={() => toggleFavorite("constellation")}
              className="absolute top-3 left-3 text-4xl z-10 transition"
            >
              <AiFillStar
                className={
                  favorites.constellation ? "text-yellow-400" : "text-black/50"
                }
              />
            </button>
            <Link
              to="/constellation"
              className="bg-white/20 hover:bg-white/30 transition rounded-xl w-[250px] h-[310px] flex flex-col items-center justify-center p-4"
            >
              <img src={starIcon} alt="별자리" className="w-27 h-28 mb-7" />
              <h3 className="text-xl font-semibold text-white">
                나만의 별자리
              </h3>
              <p className="text-sm text-gray-300 mt-1 leading-snug text-center">
                <br />
                나만의 별자리를 만들어보세요.
                <br />
                당신의 하루가 별로 남겨집니다.
              </p>
            </Link>
          </div>

          <div className="relative">
            <button
              onClick={() => toggleFavorite("diary")}
              className="absolute top-3 left-3 text-4xl z-10 transition"
            >
              <AiFillStar
                className={
                  favorites.diary ? "text-yellow-400" : "text-black/50"
                }
              />
            </button>
            <Link
              to="/diary"
              className="bg-white/20 hover:bg-white/30 transition rounded-xl w-[250px] h-[310px] flex flex-col items-center justify-center p-4"
            >
              <img src={diaryIcon} alt="일기" className="w-27 h-27 mb-7" />
              <h3 className="text-xl font-semibold text-white">나의 일기</h3>
              <p className="text-sm text-gray-300 mt-1 leading-snug text-center">
                <br />
                오늘의 감정을 기록해보세요.
                <br />
                당신의 하루가 별로 남겨집니다.
              </p>
            </Link>
          </div>

          <div className="relative">
            <button
              onClick={() => toggleFavorite("archive")}
              className="absolute top-3 left-3 text-4xl z-10 transition"
            >
              <AiFillStar
                className={
                  favorites.archive ? "text-yellow-400" : "text-black/50"
                }
              />
            </button>
            <Link
              to="/archive"
              className="bg-white/20 hover:bg-white/30 transition rounded-xl w-[250px] h-[310px] flex flex-col items-center justify-center p-4"
            >
              <img
                src={archiveIcon}
                alt="아카이브"
                className="w-25 h-25 mb-7"
              />
              <h3 className="text-xl font-semibold text-white">
                별자리 아카이브
              </h3>
              <p className="text-sm text-gray-300 mt-1 leading-snug text-center">
                <br />
                당신이 만든 별자리를
                <br />
                확인해보세요.
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
