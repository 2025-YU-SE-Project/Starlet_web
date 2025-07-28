import Sidebar from "../Sidebar";
import background from "../assets/background.png";
import starIcon from "../assets/constellation1.png";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div
      className="w-full min-h-screen bg-center bg-cover text-white flex flex-col items-center justify-start pt-28 px-4"
      style={{ backgroundImage: `url(${background})` }}
    >
      <Sidebar />

      <div className="flex flex-col items-center mb-8 text-center">
        <p className="text-base md:text-sm text-gray-300 mb-2">
          별 하나, 감정 하나
        </p>
        <h1 className="text-6xl md:text-5xl lg:text-6xl font-bold">STARLET</h1>
      </div>

      <p className="text-lg md:text-base text-center mb-12 leading-relaxed">
        기억은 흘러가지 않아요
        <br />
        오늘의 감정을 하늘에 남겨두세요
      </p>

      <div className="flex flex-wrap justify-center gap-8 md:gap-10 w-full max-w-5xl">
        <Link
          to="/constellation"
          className="bg-white/20 hover:bg-black/30 transition rounded-xl p-4 md:p-6 w-full max-w-[260px] flex flex-col items-center justify-center min-h-[200px] md:min-h-[220px]"
        >
          <img src={starIcon} alt="star" className="w-16 h-16 mb-4" />
          <h3 className="text-lg font-semibold mb-1">나만의 별자리</h3>
          <p className="text-sm text-gray-300 text-center">
            기록한 별들을 연결해보세요
            <br />
            나의 하루가 별로 남겨져요
          </p>
        </Link>

        <Link
          to="/diary"
          className="bg-white/20 hover:bg-black/30 transition rounded-xl p-4 md:p-6 w-full max-w-[260px] flex flex-col items-center justify-center min-h-[200px] md:min-h-[220px]"
        >
          <div className="text-4xl mb-4">📓</div>
          <h3 className="text-lg font-semibold mb-1">나의 일기</h3>
          <p className="text-sm text-gray-300 text-center">
            오늘의 감정을 기록해보세요
            <br />
            나의 하루가 별로 남겨져요
          </p>
        </Link>

        <Link
          to="/archive"
          className="bg-white/20 hover:bg-black/30 transition rounded-xl p-4 md:p-6 w-full max-w-[260px] flex flex-col items-center justify-center min-h-[200px] md:min-h-[220px]"
        >
          <div className="text-4xl mb-4">📖</div>
          <h3 className="text-lg font-semibold mb-1">별자리 아카이브</h3>
          <p className="text-sm text-gray-300 text-center">
            내가 만든 별자리를
            <br />
            확인해보세요
          </p>
        </Link>
      </div>
    </div>
  );
};

export default Home;
