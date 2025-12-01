import React, { useEffect, useState } from "react";
import { CiMenuBurger } from "react-icons/ci";
import { useNavigate } from "react-router-dom";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import profileImg from "../assets/MyPage/profile.png";
import { clearStorage } from "../contexts/AuthUtil";

import Sidebar from "../components/Sidebar";
import ProfileEdit from "../components/MyPage/ProfileEdit";
import RepresentativeCons from "../components/MyPage/RepresentativeCons";

import getLevel from "../apis/MyPage/getLevel";
import getUser from "../apis/MyPage/getUser";
import representativeStar from "../apis/MyPage/representativeStar";
import getYear from "../apis/MyPage/getYear";
import getMonth from "../apis/MyPage/getMonth";

const MONTH_NAMES = [
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
];

const EMOTION_ORDER = [
  "ANGER",
  "FUN",
  "HAPPINESS",
  "NEUTRAL",
  "SADNESS",
  "SURPRISE",
];

function MyPage() {
  const [nickname, setNickname] = useState(
    () => sessionStorage.getItem("nickname") || "사용자"
  );

  const [isOpen, setIsOpen] = useState(false);
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);

  const [profileUrl, setProfileUrl] = useState(profileImg);

  const [levelData, setLevelData] = useState(null);
  const [levelLoading, setLevelLoading] = useState(false);
  const [levelError, setLevelError] = useState("");

  const [userData, setUserData] = useState(null);
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState("");

  const [repStar, setRepStar] = useState(null);
  const [repStarLoading, setRepStarLoading] = useState(true);
  const [repStarError, setRepStarError] = useState(null);

  const [year, setYear] = useState(new Date().getFullYear());
  const [yearData, setYearData] = useState([]);
  const [yearLoading, setYearLoading] = useState(false);
  const [yearError, setYearError] = useState("");
  const [emotionYear] = useState(new Date().getFullYear());

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [monthData, setMonthData] = useState([]);
  const [monthLoading, setMonthLoading] = useState(false);
  const [monthError, setMonthError] = useState("");

  const navigate = useNavigate();

  const handleLogout = () => {
    clearStorage();
    navigate("/");
    navigate(0);
  };

  const normalizeProfileUrl = (rawUrl) => {
    const serverProfileUrl = rawUrl || "";

    const isBackendDefault =
      !serverProfileUrl ||
      (serverProfileUrl.includes("/public/users/") &&
        serverProfileUrl.endsWith("/profile.png")) ||
      serverProfileUrl.includes("/public/defaults/profileDefault.png");
    return isBackendDefault ? profileImg : serverProfileUrl;
  };

  useEffect(() => {
    const fetchLevel = async () => {
      try {
        setLevelLoading(true);
        setLevelError("");
        const data = await getLevel();
        setLevelData(data);
      } catch (e) {
        setLevelError(
          e?.message || "레벨 정보를 불러오는 중 오류가 발생했습니다."
        );
      } finally {
        setLevelLoading(false);
      }
    };

    fetchLevel();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setUserLoading(true);
        setUserError("");
        const data = await getUser();
        console.log("🔍 getUser 응답:", data);
        setUserData(data);

        if (data?.nickname) {
          setNickname(data.nickname);
          sessionStorage.setItem("nickname", data.nickname);
        }

        setProfileUrl(normalizeProfileUrl(data?.profilePhotoUrl));
      } catch (e) {
        setUserError(
          e?.message || "사용자 정보를 불러오는 중 오류가 발생했습니다."
        );
      } finally {
        setUserLoading(false);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchRepresentativeStar = async () => {
      try {
        setRepStarLoading(true);
        setRepStarError(null);

        const data = await representativeStar();
        setRepStar(data);
      } catch (e) {
        console.error(e);
        setRepStarError(e.message || "대표 별자리를 불러오지 못했습니다.");
      } finally {
        setRepStarLoading(false);
      }
    };

    fetchRepresentativeStar();
  }, []);

  useEffect(() => {
    const fetchYear = async () => {
      try {
        setYearLoading(true);
        setYearError("");
        const data = await getYear(year);
        setYearData(data || []);
      } catch (e) {
        console.error(e);
        setYearError(e?.message || "별자리 통계를 불러오지 못했습니다.");
        setYearData([]);
      } finally {
        setYearLoading(false);
      }
    };

    fetchYear();
  }, [year]);

  useEffect(() => {
    const fetchMonth = async () => {
      try {
        setMonthLoading(true);
        setMonthError("");
        const data = await getMonth(year, month);
        setMonthData(data || []);
      } catch (e) {
        setMonthError(e?.message || "월별 감정 통계를 불러오지 못했습니다.");
        setMonthData([]);
      } finally {
        setMonthLoading(false);
      }
    };

    fetchMonth();
  }, [year, month]);

  const minStars = levelData?.min ?? 0;
  const maxStars = levelData?.max ?? 0;
  const progressToNext =
    typeof levelData?.progressToNext === "number"
      ? levelData.progressToNext
      : null;

  let currentLevelStars = null;
  if (levelData && typeof progressToNext === "number") {
    currentLevelStars = maxStars - progressToNext;
    if (currentLevelStars < minStars) currentLevelStars = minStars;
    if (currentLevelStars > maxStars) currentLevelStars = maxStars;
  }

  let progressPercent = 0;
  if (levelData && currentLevelStars !== null && maxStars > minStars) {
    progressPercent =
      ((currentLevelStars - minStars) / (maxStars - minStars)) * 100;
    if (progressPercent < 0) progressPercent = 0;
    if (progressPercent > 100) progressPercent = 100;
  }

  const isNearMax = levelData && progressPercent >= 95;
  const displayStarCount =
    currentLevelStars !== null ? currentLevelStars : null;

  const levelName = levelData?.name || "";
  const levelNameParts = levelName.split(" ");
  const levelSuffix =
    levelNameParts.length > 1 ? levelNameParts[levelNameParts.length - 1] : "";
  const levelPrefix =
    levelNameParts.length > 1
      ? levelNameParts.slice(0, levelNameParts.length - 1).join(" ")
      : levelName;
  const isMaxLevel = levelName === "우주 탐험가";

  const totalStars = userLoading ? null : userData ? userData.totalStars : null;
  const totalConstellations = userLoading
    ? null
    : userData
    ? userData.totalConstellations
    : null;

  const friendsCount = userLoading
    ? null
    : userData
    ? userData.friendsCount
    : null;

  const monthCounts = Array.from({ length: 12 }, () => 0);
  yearData.forEach((item) => {
    if (!item) return;
    const m = item.month;
    const c = item.count ?? 0;
    if (m >= 1 && m <= 12) {
      monthCounts[m - 1] = c;
    }
  });

  const maxCountInData = Math.max(0, ...monthCounts);
  const axisMax = maxCountInData === 0 ? 4 : Math.max(4, maxCountInData);

  const xStart = 40;
  const xEnd = 310;
  const yBottom = 140;
  const yTop = 20;
  const xStep = (xEnd - xStart) / 11;

  const getX = (idx) => xStart + idx * xStep;
  const getY = (count) =>
    yBottom - (axisMax === 0 ? 0 : (count / axisMax) * (yBottom - yTop));

  const polylinePoints = monthCounts
    .map((count, idx) => `${getX(idx)},${getY(count)}`)
    .join(" ");

  const emotionCounts = EMOTION_ORDER.map((code) => {
    const row = monthData.find((item) => item.emotion === code);
    return row ? row.count ?? 0 : 0;
  });

  const maxEmotionCount = Math.max(0, ...emotionCounts);
  const maxBarHeight = 144;
  const barHeights = emotionCounts.map((c) =>
    maxEmotionCount === 0 ? 0 : (c / maxEmotionCount) * maxBarHeight
  );

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
    } else {
      setMonth(month + 1);
    }
  };

  return (
    <div className="relative w-full min-h-screen text-white">
      <div className="absolute top-11 right-50">
        <RepresentativeCons
          data={repStar}
          loading={repStarLoading}
          error={repStarError}
        />
      </div>

      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          aria-hidden="true"
          onClick={() => setIsOpen(false)}
        />
      )}
      <button
        className="ml-[1.81rem] mt-[2.13rem]"
        onClick={() => setIsOpen(true)}
        aria-label="open sidebar"
      >
        <CiMenuBurger className="cursor-pointer" size={30} />
      </button>

      <div className="relative z-10 mt-[110px]">
        <div className="max-w-[1300px] mx-auto px-6">
          <div className="flex items-center gap-6">
            <img
              src={profileUrl || profileImg}
              alt="프로필"
              className="w-[180px] h-[180px] rounded-full object-cover shadow-md"
            />

            <div className="flex flex-col mt-[110px]">
              <span className="text-medium">
                <span className="text-white font-semibold">{levelPrefix}</span>
                {levelSuffix && (
                  <span className="text-gray-300 font-medium ml-1">
                    {levelSuffix}
                  </span>
                )}
              </span>

              <span className="text-3xl mt-1">
                <span className="text-white font-bold">{nickname}</span>
                <span className="text-gray-300 font-medium ml-1 mr-5">님</span>

                <span className="text-white text-sm hover:underline hover:underline-offset-4 cursor-pointer">
                  <span className="font-medium" style={{ color: "#54C65B" }}>
                    {userLoading
                      ? "-"
                      : friendsCount !== null && friendsCount !== undefined
                      ? friendsCount
                      : 0}
                  </span>
                  명의 친구
                </span>
              </span>

              <div className="mt-4 inline-flex items-center rounded-[12px] bg-white/30 backdrop-blur px-5 py-1 ml-[-5px]">
                <div className="flex items-center gap-4 pr-5">
                  <span className="text-[14px] text-white/80">기록된 별</span>
                  <span className="text-[16px] font-semibold text-white">
                    {userLoading ? "-" : totalStars !== null ? totalStars : "-"}
                  </span>
                </div>
                <div className="h-6 w-px bg-white/30" />
                <div className="flex items-center gap-4 pl-4">
                  <span className="text-[14px] text-white/80">
                    생성한 별자리
                  </span>
                  <span className="text-[16px] font-semibold text-white">
                    {userLoading
                      ? "-"
                      : totalConstellations !== null
                      ? totalConstellations
                      : "-"}
                  </span>
                </div>
              </div>

              {(levelError || userError) && (
                <div className="mt-2 text-xs text-red-300 space-y-1">
                  {levelError && <div>{levelError}</div>}
                  {userError && <div>{userError}</div>}
                </div>
              )}
            </div>

            <button
              className="ml-auto mt-20 px-4 py-2 rounded-[10px] bg-[#D9D9D9] text-[#403F3F] font-medium cursor-pointer"
              onClick={() => setIsProfileEditOpen(true)}
            >
              프로필 편집
            </button>
          </div>
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 bg-black/30 z-0"
        style={{ top: "280px" }}
      />

      <div className="relative z-10">
        <div className="max-w-[1270px] mx-auto px-6">
          <div className="mt-10 relative">
            <div className="flex justify-end mb-1 pr-2 text-sm text-[#E5E5E5]">
              {levelLoading ? (
                <span className="opacity-90">레벨 정보를 불러오는 중...</span>
              ) : levelData ? (
                <>
                  {!isMaxLevel &&
                    progressToNext !== null &&
                    progressToNext > 0 && (
                      <span className="opacity-90">
                        다음 레벨까지 -{progressToNext}
                      </span>
                    )}
                </>
              ) : (
                <span className="opacity-90">
                  레벨 정보를 불러오지 못했습니다.
                </span>
              )}
            </div>

            <div className="relative w-full h-10 rounded-[10px] bg-[#D9D9D9] overflow-hidden">
              <div
                className="h-full bg-[#54C65B] transition-all duration-500"
                style={{
                  width: `${levelData ? progressPercent : 0}%`,
                }}
              />
            </div>

            <div
              className={`absolute -translate-x-1/2 inline-flex items-center bg-[#54C65B] text-white text-sm font-semibold px-3 py-1 rounded-full ${
                isNearMax ? "top-[115%]" : "top-[90%]"
              }`}
              style={{
                left: isNearMax
                  ? `calc(${progressPercent}% - 14px)`
                  : `${progressPercent}%`,
              }}
            >
              <span className="whitespace-nowrap">
                ★{" "}
                {levelLoading
                  ? "-"
                  : displayStarCount !== null
                  ? displayStarCount
                  : "-"}
              </span>
            </div>

            <div className="flex justify-between text-xs text-gray-300 mt-2">
              <span>{levelData ? minStars : 0}</span>
              <span>{levelData ? maxStars : "-"}</span>
            </div>
          </div>

          <div className="mt-13">
            <div className="w-full h-[1px] bg-white/30" />
          </div>

          <div className="pt-6 flex flex-row items-start justify-between gap-8">
            <div className="flex-1">
              <div className="text-center text-lg font-semibold text-white mb-2">
                감정별 일기 수
              </div>

              <div className="relative flex items-center justify-center text-gray-300 font-medium mb-5 w-40 mx-auto">
                <IoChevronBack
                  className="absolute left-0 cursor-pointer hover:opacity-80 "
                  onClick={handlePrevMonth}
                />
                <span className="text-center select-none">
                  {MONTH_NAMES[month - 1]}
                </span>
                <IoChevronForward
                  className="absolute right-0 cursor-pointer hover:opacity-80"
                  onClick={handleNextMonth}
                />
              </div>

              <div className="grid grid-cols-6 items-end h-42">
                {/* 화나요 */}
                <div className="flex flex-col items-center">
                  <div
                    className="w-10 bg-[#F23B00] rounded-md transition-all duration-300"
                    style={{ height: `${barHeights[0] || 0}px` }}
                  />
                </div>
                {/* 웃겨요 */}
                <div className="flex flex-col items-center">
                  <div
                    className="w-10 bg-[#FEA004] rounded-md transition-all duration-300"
                    style={{ height: `${barHeights[1] || 0}px` }}
                  />
                </div>
                {/* 행복해요 */}
                <div className="flex flex-col items-center">
                  <div
                    className="w-10 bg-[#FEE444] rounded-md transition-all duration-300"
                    style={{ height: `${barHeights[2] || 0}px` }}
                  />
                </div>
                {/* 잘 모르겠어요 */}
                <div className="flex flex-col items-center">
                  <div
                    className="w-10 bg-[#9AFF93] rounded-md transition-all duration-300"
                    style={{ height: `${barHeights[3] || 0}px` }}
                  />
                </div>
                {/* 슬퍼요 */}
                <div className="flex flex-col items-center">
                  <div
                    className="w-10 bg-[#5DDCFF] rounded-md transition-all duration-300"
                    style={{ height: `${barHeights[4] || 0}px` }}
                  />
                </div>
                {/* 놀라워요 */}
                <div className="flex flex-col items-center">
                  <div
                    className="w-10 bg-[#C69EFF] rounded-md transition-all duration-300"
                    style={{ height: `${barHeights[5] || 0}px` }}
                  />
                </div>
              </div>

              <div className="mt-1.5 h-[1.5px] w-full bg-white/40 rounded-full" />
              <div className="mt-2 grid grid-cols-6 text-center">
                <div>
                  <div className="text-base font-medium">화나요</div>
                  <div className="text-[14px] text-gray-300">
                    <span className="mx-1">
                      {monthLoading ? "-" : emotionCounts[0] ?? 0}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-base font-medium">웃겨요</div>
                  <div className="text-[14px] text-gray-300">
                    <span className="mx-1">
                      {monthLoading ? "-" : emotionCounts[1] ?? 0}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-base font-medium">행복해요</div>
                  <div className="text-[14px] text-gray-300">
                    <span className="mx-1">
                      {monthLoading ? "-" : emotionCounts[2] ?? 0}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-base font-medium whitespace-nowrap">
                    잘 모르겠어요
                  </div>
                  <div className="text-[14px] text-gray-300">
                    <span className="mx-1">
                      {monthLoading ? "-" : emotionCounts[3] ?? 0}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-base font-medium">슬퍼요</div>
                  <div className="text-[14px] text-gray-300">
                    <span className="mx-1">
                      {monthLoading ? "-" : emotionCounts[4] ?? 0}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-base font-medium">놀라워요</div>
                  <div className="text-[14px] text-gray-300">
                    <span className="mx-1">
                      {monthLoading ? "-" : emotionCounts[5] ?? 0}
                    </span>
                  </div>
                </div>
              </div>

              {monthError && (
                <div className="mt-2 text-[11px] text-red-300 text-center">
                  {monthError}
                </div>
              )}
            </div>

            <div className="w-[1px] bg-white/30 self-stretch" />

            <div className="flex-1">
              <div className="text-center text-lg font-semibold text-white mb-2">
                생성된 별자리 수
              </div>
              <div className="text-center text-gray-300 font-medium mb-4 flex items-center justify-center gap-3">
                <IoChevronBack
                  className="cursor-pointer hover:opacity-80"
                  onClick={() => setYear(year - 1)}
                />
                <span className="px-4 select-none">{year}</span>
                <IoChevronForward
                  className="cursor-pointer hover:opacity-80"
                  onClick={() => setYear(year + 1)}
                />
              </div>

              <div className="w-full h-56 relative">
                <svg viewBox="0 0 340 160" className="w-full h-full">
                  <line
                    x1="30"
                    y1="10"
                    x2="30"
                    y2="140"
                    stroke="#FFFFFF80"
                    strokeWidth="1"
                  />
                  <line
                    x1="30"
                    y1="140"
                    x2="320"
                    y2="140"
                    stroke="#FFFFFF80"
                    strokeWidth="1"
                  />

                  {Array.from({ length: 5 }).map((_, i) => {
                    const value = Math.round((axisMax / 4) * i);
                    const y = getY(value);
                    return (
                      <g key={i}>
                        <line
                          x1="30"
                          x2="30"
                          y1={y}
                          y2={y}
                          stroke="#FFFFFF99"
                        />
                        <text x="15" y={y + 4} fontSize="10" fill="#D1D5DB">
                          {value}
                        </text>
                      </g>
                    );
                  })}

                  {!yearLoading && monthCounts.some((c) => c > 0) && (
                    <polyline
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      points={polylinePoints}
                    />
                  )}

                  {!yearLoading &&
                    monthCounts.map((count, idx) => (
                      <circle
                        key={idx}
                        cx={getX(idx)}
                        cy={getY(count)}
                        r="4"
                        fill="#FFFFFF"
                        stroke="#00000055"
                        strokeWidth="1"
                      />
                    ))}

                  {Array.from({ length: 12 }).map((_, i) => (
                    <text
                      key={i}
                      x={getX(i)}
                      y="155"
                      fontSize="10"
                      textAnchor="middle"
                      fill="#9CA3AF"
                    >
                      {i + 1}
                    </text>
                  ))}
                </svg>

                {yearError && (
                  <div className="absolute left-0 right-0 bottom-0 text-[11px] text-red-300 text-center">
                    {yearError}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full mt-16 pb-10 flex items-center justify-center gap-6 text-sm">
        <button className="text-white hover:underline underline-offset-4 cursor-pointer drop-shadow-[0_0_6px_rgba(0,0,0,0.7)]">
          계정 탈퇴
        </button>
        <span className="text-white font-extralight drop-shadow-[0_0_6px_rgba(0,0,0,0.7)]">
          |
        </span>
        <button
          className="text-white hover:underline underline-offset-4 cursor-pointer drop-shadow-[0_0_6px_rgba(0,0,0,0.7)]"
          onClick={handleLogout}
        >
          로그아웃
        </button>
      </div>

      <ProfileEdit
        open={isProfileEditOpen}
        onClose={() => setIsProfileEditOpen(false)}
        currentNickname={nickname}
        currentProfileUrl={profileUrl}
        onComplete={({ nickname: newNickname, profileUrl: newProfileUrl }) => {
          if (newNickname) {
            setNickname(newNickname);
            sessionStorage.setItem("nickname", newNickname);
          }
          if (newProfileUrl) {
            const normalized = normalizeProfileUrl(newProfileUrl);
            setProfileUrl(normalized);
            setUserData((prev) =>
              prev ? { ...prev, profilePhotoUrl: normalized } : prev
            );
          }
        }}
      />
    </div>
  );
}

export default MyPage;
