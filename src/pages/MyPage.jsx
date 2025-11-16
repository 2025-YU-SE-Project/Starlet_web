import React from "react";
import { CiMenuBurger } from "react-icons/ci";
import Sidebar from "../components/Sidebar";
import profileImg from "../assets/MyPage/profile.png";
import ProfileEdit from "../components/MyPage/ProfileEdit";

function MyPage() {
  const [nickname, setNickname] = React.useState(
    () => sessionStorage.getItem("nickname") || "사용자"
  );
  const [isOpen, setIsOpen] = React.useState(false);
  const [isProfileEditOpen, setIsProfileEditOpen] = React.useState(false);

  return (
    <div className="relative w-full min-h-screen text-white">
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

      <section className="relative z-10 mt-[110px]">
        <div className="max-w-[1300px] mx-auto px-6">
          <div className="flex items-center gap-6">
            <img
              src={profileImg}
              alt="프로필"
              className="w-[180px] h-[180px] rounded-full object-cover shadow-md"
            />

            <div className="flex flex-col mt-[110px]">
              <span className="text-medium">
                <span className="text-white font-semibold">별무리</span>
                <span className="text-gray-300 font-medium ml-1">탐험가</span>
              </span>

              <span className="text-3xl mt-1">
                <span className="text-white font-bold">{nickname}</span>
                <span className="text-gray-300 font-medium ml-1">님</span>
              </span>

              <div className="mt-4 inline-flex items-center rounded-[12px] bg-white/30 backdrop-blur px-5 py-1 ml-[-5px]">
                <div className="flex items-center gap-4 pr-5">
                  <span className="text-[14px] text-white/90">기록된 별</span>
                  <span className="text-[16px] font-bold text-white">27</span>
                </div>
                <div className="h-6 w-px bg-white/30" />
                <div className="flex items-center gap-4 pl-4">
                  <span className="text-[14px] text-white/90">
                    생성한 별자리
                  </span>
                  <span className="text-[16px] font-bold text-white">7</span>
                </div>
              </div>
            </div>

            <button
              className="ml-auto mt-20 px-4 py-2 rounded-[10px] bg-[#D9D9D9] text-[#403F3F] font-medium cursor-pointer"
              onClick={() => setIsProfileEditOpen(true)}
            >
              프로필 편집
            </button>
          </div>
        </div>
      </section>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 bg-black/30 z-0"
        style={{ top: "280px" }}
      />

      <div className="relative z-10">
        <div className="max-w-[1270px] mx-auto px-6">
          <div className="mt-10 relative">
            <div className="flex justify-end mb-1 pr-2 text-sm text-[#E5E5E5]">
              <span className="opacity-90">다음 레벨까지 -2</span>
            </div>
            <div className="relative w-full h-10 rounded-[10px] bg-[#D9D9D9] overflow-hidden">
              <div className="h-full bg-[#54C65B]" style={{ width: "72%" }} />
            </div>
            <div
              className="absolute top-full -translate-x-1/2 inline-flex items-center bg-[#54C65B] text-white text-sm font-semibold px-3 py-1 rounded-full"
              style={{ left: "72%" }}
            >
              ★ 27
            </div>
            <div className="flex justify-between text-xs text-gray-300 mt-2">
              <span>10</span>
              <span>29</span>
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
