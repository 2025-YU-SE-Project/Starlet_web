import React, { useEffect, useState } from "react";
import { CiMenuBurger } from "react-icons/ci";
import Sidebar from "../components/Sidebar";
import profileImg from "../assets/MyPage/profile.png";
import ProfileEdit from "../components/MyPage/ProfileEdit";
import getLevel from "../apis/MyPage/getLevel";
import getUser from "../apis/MyPage/getUser";
import representativeStar from "../apis/MyPage/representativeStar";
import RepresentativeCons from "../components/MyPage/RepresentativeCons";

function MyPage() {
  const [nickname, setNickname] = useState(
    () => sessionStorage.getItem("nickname") || "사용자"
  );

  const [isOpen, setIsOpen] = useState(false);
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);

  const [levelData, setLevelData] = useState(null);
  const [levelLoading, setLevelLoading] = useState(false);
  const [levelError, setLevelError] = useState("");

  const [userData, setUserData] = useState(null);
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState("");

  const [repStar, setRepStar] = useState(null);
  const [repStarLoading, setRepStarLoading] = useState(true);
  const [repStarError, setRepStarError] = useState(null);

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
        setUserData(data);

        if (data?.nickname) {
          setNickname(data.nickname);
          sessionStorage.setItem("nickname", data.nickname);
        }
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

  const totalStars = userLoading ? null : userData ? userData.totalStars : null;
  const totalConstellations = userLoading
    ? null
    : userData
    ? userData.totalConstellations
    : null;

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
              src={profileImg}
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
                    10
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
                  {progressToNext !== null && progressToNext > 0 && (
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
            <div className="w-full h-px bg-white/20" />
          </div>

          <div className="pt-6 flex flex-row items-start justify-between gap-8">
            <div className="flex-1">
              <div className="text-center text-lg font-semibold text-white mb-2">
                감정별 일기 수
              </div>

              <div className="text-center text-gray-300 font-medium mb-4 flex items-center justify-center">
                <span className="px-4">&lt;</span>
                SEPTEMBER
                <span className="px-4">&gt;</span>
              </div>

              <div className="grid grid-cols-6 items-end h-43">
                {/* 화나요 */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-36 bg-[#F23B00] rounded-md" />
                </div>
                {/* 웃겨요 */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-28 bg-[#FEA004] rounded-md" />
                </div>
                {/* 행복해요 */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-24 bg-[#FEE444] rounded-md" />
                </div>
                {/* 잘 모르겠어요 */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-16 bg-[#9AFF93] rounded-md" />
                </div>
                {/* 슬퍼요 */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-20 bg-[#5DDCFF] rounded-md" />
                </div>
                {/* 놀라워요 */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-24 bg-[#C69EFF] rounded-md" />
                </div>
              </div>

              <div className="mt-3 h-[1px] w-full bg-white/40 rounded-full" />
              <div className="mt-2 grid grid-cols-6 text-center">
                <div>
                  <div className="text-base font-medium">화나요</div>
                  <div className="text-sm text-gray-300">
                    <span className="mx-1">10</span>
                  </div>
                </div>
                <div>
                  <div className="text-base font-medium">웃겨요</div>
                  <div className="text-sm text-gray-300">
                    <span className="mx-1">7</span>
                  </div>
                </div>
                <div>
                  <div className="text-base font-medium">행복해요</div>
                  <div className="text-sm text-gray-300">
                    <span className="mx-1">5</span>
                  </div>
                </div>
                <div>
                  <div className="text-base font-medium whitespace-nowrap">
                    잘 모르겠어요
                  </div>
                  <div className="text-sm text-gray-300">
                    <span className="mx-1">3</span>
                  </div>
                </div>
                <div>
                  <div className="text-base font-medium">슬퍼요</div>
                  <div className="text-sm text-gray-300">
                    <span className="mx-1">3</span>
                  </div>
                </div>
                <div>
                  <div className="text-base font-medium">놀라워요</div>
                  <div className="text-sm text-gray-300">
                    <span className="mx-1">4</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-px bg-white/30 self-stretch" />

            <div className="flex-1">
              <div className="text-center text-lg font-semibold text-white mb-2">
                생성된 별자리 수
              </div>
              <div className="text-center text-gray-300 font-medium mb-4">
                <span className="px-4">&lt;</span>
                2025
                <span className="px-4">&gt;</span>
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
                  {[0, 1, 2, 3, 4].map((t, i) => (
                    <g key={i}>
                      <line
                        x1="26"
                        x2="30"
                        y1={140 - i * 28}
                        y2={140 - i * 28}
                        stroke="#FFFFFF99"
                      />
                      <text
                        x="15"
                        y={144 - i * 28}
                        fontSize="10"
                        fill="#D1D5DB"
                      >
                        {i}
                      </text>
                    </g>
                  ))}
                  <polyline
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    points="40,130 70,120 100,140 130,90 160,70 190,100 220,80 250,110 280,140 310,140"
                  />
                  {[40, 70, 100, 130, 160, 190, 220, 250, 280, 310].map(
                    (x, i) => (
                      <circle
                        key={i}
                        cx={x}
                        cy={[130, 120, 140, 90, 70, 100, 80, 110, 140, 140][i]}
                        r="4"
                        fill="#FFFFFF"
                        stroke="#00000055"
                        strokeWidth="1"
                      />
                    )
                  )}
                  {Array.from({ length: 12 }).map((_, i) => (
                    <text
                      key={i}
                      x={40 + i * 24}
                      y="155"
                      fontSize="9"
                      fill="#9CA3AF"
                    >
                      {i + 1}
                    </text>
                  ))}
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProfileEdit
        open={isProfileEditOpen}
        onClose={() => setIsProfileEditOpen(false)}
        onComplete={(newNickname) => {
          if (!newNickname) return;
          setNickname(newNickname);
          sessionStorage.setItem("nickname", newNickname);
        }}
      />
    </div>
  );
}

export default MyPage;
