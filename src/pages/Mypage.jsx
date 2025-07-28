
import React, { useRef, useState } from "react";
import DefaultAvatar from "../assets/default-profile.png";

// recharts 차트 라이브러리
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
} from "recharts";


const emotionData = [
  { name: "기쁨",   count: 10, fill: "#d8b4fe" },
  { name: "슬픔",   count:  7, fill: "#93c5fd" },
  { name: "화남",   count:  5, fill: "#fca5a5" },
  { name: "짜증남", count:  3, fill: "#c4b5fd" },
];

const constellationData = [
  { month: "1월",  count: 1 },
  { month: "2월",  count: 2 },
  { month: "3월",  count: 1 },
  { month: "4월",  count: 3 },
  { month: "5월",  count: 4 },
  { month: "6월",  count: 2 },
  { month: "7월",  count: 3 },
  { month: "8월",  count: 2 },
  { month: "9월",  count: 0 },
  { month: "10월", count: 0 },
  { month: "11월", count: 0 },
  { month: "12월", count: 0 },
];

const Mypage = () => {
  const [tab, setTab] = useState("stats");         
  const [userData, setUserData] = useState({
    nickname: "HYEON",
    level: "마스터",
    profileImagePath: "",
    currentExp: 55,            // 0‑100 (다음 레벨까지 45 %)
    totalStars: 27,
    totalConstellations: 3,
  });

  /* 프로필 이미지 */
  const fileInputRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(DefaultAvatar);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreviewImage(URL.createObjectURL(file));
  };

  return (
    <>
      <section className="mx-auto max-w-screen-xl px-6 text-white pt-5">
        <h1 className="font-julius text-6xl mb-5 mt-20">MY PAGE</h1>

        {/* 프로필 카드 (상단 고정) */}
        <div className="w-160 bg-white/10 rounded-3xl shadow-2xl p-8 flex items-center gap-8">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0"
          >
            <img
              src={previewImage}
              alt="profile"
              className="rounded-full w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 object-cover"
            />
          </button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          {/* 닉네임, 레벨 */}
          <div className="flex flex-col gap-2 flex-1">
            <input
              value={userData.nickname}
              onChange={(e) =>
                setUserData({ ...userData, nickname: e.target.value })
              }
              className="bg-transparent outline-none font-julius text-3xl"
            />
            <input
              value={userData.level}
              onChange={(e) =>
                setUserData({ ...userData, level: e.target.value })
              }
              className="bg-transparent outline-none font-julius text-xl md:text-2xl"
            />
            <button
              onClick={() => alert("백엔드 연동 전")}
              className="self-end mt-4 text-lg hover:font-bold hover:underline"
            >
              저장
            </button>
          </div>
        </div>
      </section>

      <section className="mt-20 px-6 text-white mx-auto max-w-screen-xl">
        <div className="flex gap-6 text-2xl mb-6 border-b">
          <span
            onClick={() => setTab("stats")}
            className={`pb-2 cursor-pointer ${
              tab === "stats" ? "font-bold border-b-2" : "hover:font-bold"
            }`}
          >
            통계
          </span>
          <span
            onClick={() => setTab("profile")}
            className={`pb-2 cursor-pointer ${
              tab === "profile" ? "font-bold border-b-2" : "hover:font-bold"
            }`}
          >
            프로필
          </span>
        </div>

        {tab === "stats" && (
          <div className="grid gap-8 sm:grid-cols-2">
            {/* 감정별 바차트 */}
            <div className="bg-white/10 p-6 rounded-3xl">
              <h2 className="font-julius text-2xl mb-4">
                감정별 일기 수 (월)
              </h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={emotionData}>
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "white", fontSize: 16 }}
                    />
                    <YAxis
                      tick={{ fill: "white", fontSize: 16 }}
                      allowDecimals={false}
                    />
                    <Bar dataKey="count">
                      {emotionData.map((d, i) => (
                        <Cell key={i} fill={d.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 별자리 라인차트 */}
            <div className="bg-white/10 p-6 rounded-3xl">
              <h2 className="font-julius text-2xl mb-4">
                별자리 생성 수 (월별)
              </h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={constellationData}>
                    <XAxis
                      dataKey="month"
                      tick={{ fill: "white", fontSize: 16 }}
                    />
                    <YAxis
                      tick={{ fill: "white", fontSize: 16 }}
                      allowDecimals={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#ffffff"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

      {/*프로필*/}
        {tab === "profile" && (
          <div className="flex flex-col md:flex-row gap-10">
            <div className="flex-1 mt-10">
              <p className="text-3xl">닉네임 : {userData.nickname}</p>
              <p className="text-2xl mb-6">
                레벨 : {userData.level} (Lv.5)
              </p>

              <p className="mb-2 text-xl mt-10">
                (다음 레벨까지 {100 - userData.currentExp}%)
              </p>

              {/* 경험치바 */}
              <div className="relative h-10 rounded bg-white/20 w-[500px]">
                <div
                  className="absolute h-full rounded bg-green-400"
                  style={{ width: `${userData.currentExp}%` }}
                />
                <span className="absolute -left-3 -bottom-6 text-xl">0</span>
                <span className="absolute right-0 -bottom-6 text-xl">100</span>
              </div>
            </div>

            {/* 오른쪽 : 누적 기록 카드 */}
            <div className="bg-white/10 rounded-3xl p-10 h-40 w-100 mt-15 mr-30">
              <p className="text-xl mb-4">
                ☆기록된 별:{" "}
                <span className="font-bold">{userData.totalStars}</span>
              </p>
              <p className="text-xl">
                ★생성한 별자리:{" "}
                <span className="font-bold">
                  {userData.totalConstellations}
                </span>
              </p>
            </div>
          </div>
        )}
      </section>
    </>
  );
};

export default Mypage;
