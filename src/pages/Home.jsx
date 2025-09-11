import { useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import starIcon from "../assets/const.png";
import diaryIcon from "../assets/diary.png";
import archiveIcon from "../assets/archive.png";

const Home = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full min-h-screen overflow-hidden">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div
        className={`z-10 transition-transform duration-300 ${
          isOpen ? "translate-x-[200px]" : ""
        }`}
      >
        <div className="w-full flex flex-col pt-20 px-10 lg:px-24">
          <div className="max-w-3xl mb-10 md:ml-20">
            <p className="text-[20px] text-white m-0 mb-2">
              별 하나, 감정 하나
            </p>
            <span
              className="text-[80px] text-white leading-none"
              style={{ fontFamily: "'Julius Sans One', sans-serif" }}
            >
              STARLET
            </span>
            <p className="text-[24px] mt-4 text-white pl-3">
              "기억은 흘러가지 않아요.
            </p>
            <p className="text-[24px] text-white pl-24">
              오늘의 감정을 하늘에 남겨두세요."
            </p>
          </div>
        </div>
      </div>

      <div
        className={`z-10 transition-transform duration-300 ${
          isOpen ? "translate-x-[80px]" : ""
        }`}
      >
        <div className="z-10 flex justify-center gap-[88px] flex-wrap">
          <Link
            to="/sky"
            className="bg-[#808080]/55 hover:bg-[#808080]/65 transition rounded-[35px] w-[250px] h-[310px] flex flex-col items-center justify-center"
          >
            <img src={starIcon} alt="별자리" className="w-28 h-28 mb-5" />
            <span className="text-[25px] text-white">밤하늘 페이지</span>
            <p className="text-[12px] text-white text-center">
              <br />
              나만의 별자리를 만들어보세요.
              <br />
              당신의 하루가 별로 남겨집니다.
            </p>
          </Link>

          <Link
            to="/calendar"
            className="bg-[#808080]/55 hover:bg-[#808080]/65 transition rounded-[35px] w-[250px] h-[310px] flex flex-col items-center justify-center"
          >
            <img src={diaryIcon} alt="일기" className="w-28 h-28 mb-5" />
            <span className="text-[25px] text-white">나의 일기</span>
            <p className="text-[12px] text-white text-center">
              <br />
              오늘의 감정을 기록해보세요.
              <br />
              당신의 하루가 별로 남겨집니다.
            </p>
          </Link>

          <Link
            to="/archive"
            className="bg-[#808080]/55 hover:bg-[#808080]/65 transition rounded-[35px] w-[250px] h-[310px] flex flex-col items-center justify-center"
          >
            <img
              src={archiveIcon}
              alt="아카이브"
              className="w-[120px] h-[120px] mb-5"
            />
            <span className="text-[25px] text-white">별자리 아카이브</span>
            <p className="text-[12px] text-white text-center">
              <br />
              당신이 만든 별자리를
              <br />
              확인해보세요.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
