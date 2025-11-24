// src/pages/FriendsList.jsx
import React from "react";
import { HiOutlineMenu } from "react-icons/hi";
import { HiPlusSmall, HiOutlineTrash } from "react-icons/hi2";

const friends = [
  {
    id: 1,
    name: "조민서",
    level: "별무리 탐험가",
    totalStars: 70,
    totalConstellations: 10,
    avatarUrl: "/sample/friend1.png",
  },
  {
    id: 2,
    name: "나현",
    level: "성운 탐험가",
    totalStars: 70,
    totalConstellations: 10,
    avatarUrl: "/sample/friend2.png",
  },
  {
    id: 3,
    name: "몸시긴이름을가진사람",
    level: "별무리 탐험가",
    totalStars: 70,
    totalConstellations: 10,
    avatarUrl: "/sample/friend3.png",
  },
  {
    id: 4,
    name: "안농",
    level: "별무리 탐험가",
    totalStars: 70,
    totalConstellations: 10,
    avatarUrl: "/sample/friend4.png",
  },
  {
    id: 5,
    name: "이름짓기귀찮아요",
    level: "별무리 탐험가",
    totalStars: 70,
    totalConstellations: 10,
    avatarUrl: "/sample/friend5.png",
  },
];

export default function FriendsList() {
  const handleAddFriend = () => {
    // TODO: 친구 추가 모달 열기
    alert("친구 추가 클릭!");
  };

  const handleCheckRequests = () => {
    // TODO: 친구 요청 확인 페이지 이동
    alert("친구 요청 확인하기 클릭!");
  };

  const handleRemoveFriend = (id) => {
    // TODO: 실제 삭제 로직 연결
    if (window.confirm("친구를 삭제하시겠습니까?")) {
      console.log("remove friend", id);
    }
  };

  return (
    <div
      className="min-h-screen w-full text-white relative overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #4067d4 0%, #243566 40%, #050818 100%)",
      }}
    >
      {/* 별 배경 (간단한 점 효과) */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(2px 2px at 10% 20%, rgba(255,255,255,0.8) 0, transparent 50%), radial-gradient(1.5px 1.5px at 80% 10%, rgba(255,255,255,0.8) 0, transparent 50%), radial-gradient(1.5px 1.5px at 30% 80%, rgba(255,255,255,0.7) 0, transparent 50%), radial-gradient(2px 2px at 60% 60%, rgba(255,255,255,0.9) 0, transparent 50%)",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-6 pb-10">
        {/* 상단 헤더 */}
        <header className="flex items-center gap-4 mb-10">
          <button
            type="button"
            className="p-2 rounded-full hover:bg-white/10 transition"
            aria-label="메뉴 열기"
          >
            <HiOutlineMenu className="w-7 h-7" />
          </button>
          <h1 className="text-[28px] md:text-[32px] font-bold tracking-tight">
            친구 목록
          </h1>
        </header>

        {/* 프로필 + 친구 추가 영역 */}
        <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 mb-10">
          {/* 내 프로필 카드 */}
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-white/10 flex items-center justify-center shadow-lg">
              {/* 프로필 이미지 자리 (지금은 아이콘 느낌으로 별) */}
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl">
                ★
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="inline-flex items-center gap-2 text-[13px] md:text-[14px] font-medium">
                <span className="px-3 py-1 rounded-full bg-white/15">
                  별무리 탐험가
                </span>
                <span className="px-3 py-1 rounded-full bg-[#36D968] text-[12px] font-semibold">
                  ME
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-[22px] md:text-[26px] font-bold">
                  이나현 님
                </span>
              </div>

              <div className="flex flex-wrap gap-2 text-[11px] md:text-[12px] text-white/80">
                <span className="px-3 py-1 rounded-full bg-white/10">
                  기록된 별 <span className="font-semibold">27</span>
                </span>
                <span className="px-3 py-1 rounded-full bg-white/10">
                  생성한 별자리 <span className="font-semibold">7</span>
                </span>
              </div>

              <button
                type="button"
                onClick={handleCheckRequests}
                className="mt-1 text-[12px] md:text-[13px] text-[#f5f5f5] underline underline-offset-4 hover:text-white/90 text-left"
              >
                친구 요청 확인하기
              </button>
            </div>
          </div>

          {/* 친구 추가 버튼 */}
          <div className="flex md:justify-end">
            <button
              type="button"
              onClick={handleAddFriend}
              className="inline-flex items-center gap-2 bg-[#46CF6A] hover:bg-[#40be60] text-[14px] md:text-[15px] font-semibold px-5 py-2.5 rounded-full shadow-md"
            >
              <HiPlusSmall className="w-5 h-5" />
              친구 추가
            </button>
          </div>
        </section>

        {/* 친구 수 텍스트 */}
        <div className="mb-3 text-[13px] text-white/80">
          {friends.length}명의 친구
        </div>

        {/* 친구 리스트 헤더 */}
        <div className="hidden md:grid grid-cols-[2.5fr,2fr,2fr,2fr,56px] text-[13px] text-white/70 px-8 py-3 border-y border-white/15 bg-white/5 rounded-t-2xl">
          <span>name</span>
          <span>level</span>
          <span>total stars</span>
          <span>total constellations</span>
          <span />
        </div>

        {/* 친구 리스트 */}
        <div className="divide-y divide-white/10 rounded-2xl bg-white/5 backdrop-blur-md overflow-hidden">
          {/* 모바일용 헤더 (살짝 다르게) */}
          <div className="md:hidden px-4 py-3 text-[12px] text-white/70 flex justify-between">
            <span>name</span>
            <span>stars / constellations</span>
          </div>

          {friends.map((f) => (
            <div
              key={f.id}
              className="grid grid-cols-1 md:grid-cols-[2.5fr,2fr,2fr,2fr,56px] items-center px-4 md:px-8 py-4 md:py-5 gap-y-3 hover:bg-white/5 transition"
            >
              {/* name */}
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full overflow-hidden bg-white/20 flex-shrink-0">
                  {f.avatarUrl ? (
                    <img
                      src={f.avatarUrl}
                      alt={f.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl">
                      🌟
                    </div>
                  )}
                </div>
                <span className="text-[14px] md:text-[15px] font-medium">
                  {f.name}
                </span>
              </div>

              {/* level */}
              <div className="flex md:justify-start md:items-center">
                <span className="inline-flex px-4 py-1 rounded-full bg-black/40 text-[11px] md:text-[12px]">
                  {f.level}
                </span>
              </div>

              {/* total stars */}
              <div className="flex md:justify-start text-[12px] md:text-[13px]">
                <span className="text-[#5AE36C] font-semibold mr-1">
                  {f.totalStars}
                </span>
                <span className="text-white/75">stars</span>
              </div>

              {/* total constellations */}
              <div className="flex md:justify-start text-[12px] md:text-[13px]">
                <span className="text-[#3ED1A3] font-semibold mr-1">
                  {f.totalConstellations}
                </span>
                <span className="text-white/75">constellations</span>
              </div>

              {/* 삭제 아이콘 */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => handleRemoveFriend(f.id)}
                  className="w-9 h-9 rounded-full border border-white/35 flex items-center justify-center hover:bg-white/10"
                  aria-label={`${f.name} 삭제`}
                >
                  <HiOutlineTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
