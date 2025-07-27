import Sidebar from "../Sidebar";
import background from "../assets/background.png";
import starIcon from "../assets/constellation1.png";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div
      className="w-full h-screen bg-center bg-cover text-white"
      style={{ backgroundImage: `url(${background})` }}
    >
      <Sidebar />

      <div className="flex flex-col items-center justify-center h-full text-center px-4">
        <div className="flex flex-col items-center mb-4">
          <p className="text-md text-gray-300 mb-1">별 하나, 감정 하나</p>
          <h1 className="text-6xl font-bold">별 담</h1>
        </div>
        <p className="text-lg mb-12">
          기억은 흘러가지 않아요
          <br />
          오늘의 감정을 하늘에 남겨두세요
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 나만의 별자리 */}
          <Link
            to="/constellation"
            className="bg-white/20 hover:bg-black/30 transition rounded-xl p-6 w-64 h-64 flex flex-col items-center justify-center"
          >
            <img src={starIcon} alt="star" className="w-16 h-16 mb-4" />
            <h3 className="text-2xl font-semibold mb-2">나만의 별자리</h3>
            <p className="text-sm text-gray-300">
              기록한 별들을 연결해보세요
              <br />
              나의 하루가 별로 남겨져요
            </p>
          </Link>

          {/* 나의 일기 */}
          <Link
            to="/diary"
            className="bg-white/20 hover:bg-black/30 transition rounded-xl p-6 w-64 h-64 flex flex-col items-center justify-center"
          >
            <div className="text-5xl mb-4">📓</div>
            <h3 className="text-2xl font-semibold mb-2">나의 일기</h3>
            <p className="text-sm text-gray-300">
              오늘의 감정을 기록해보세요
              <br />
              나의 하루가 별로 남겨져요
            </p>
          </Link>

          {/* 별자리 아카이브 */}
          <Link
            to="/archive"
            className="bg-white/20 hover:bg-black/30 transition rounded-xl p-6 w-64 h-64 flex flex-col items-center justify-center"
          >
            <div className="text-5xl mb-4">📖</div>
            <h3 className="text-2xl font-semibold mb-2">별자리 아카이브</h3>
            <p className="text-sm text-gray-300">
              내가 만든 별자리를
              <br />
              확인해보세요
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
