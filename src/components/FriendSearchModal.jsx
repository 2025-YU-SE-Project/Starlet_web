import React, { useState } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import { IoMdClose } from "react-icons/io";
import { searchFriend } from "../apis/friends/search";
import { requestFriend } from "../apis/friends/request";
import profileImg from "../assets/MyPage/profile.png";

export default function FriendSearchModal({ isOpen, onClose }) {
  const [nickname, setNickname] = useState("");
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [result, setResult] = useState(null);
  const [requesting, setRequesting] = useState(false);
  const [requestDone, setRequestDone] = useState(false);

  const handleSearch = async () => {
    if (!nickname.trim()) return;
    try {
      setSearching(true);
      const data = await searchFriend(nickname);
      setResult(data);
      setSearched(true);
    } catch (err) {
      console.error("친구 검색 실패:", err);
      setResult(null);
      setSearched(true);
    } finally {
      setSearching(false);
    }
  };

  const handleRequest = async () => {
    try {
      setRequesting(true);
      await requestFriend(result.nickname);
      setRequestDone(true);
    } catch (err) {
      console.error("친구 신청 실패:", err);
      alert("친구 신청 중 오류가 발생했습니다.");
    } finally {
      setRequesting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-[800px] bg-[#f5f5f5] h-[42vh] rounded-[18px] shadow-xl overflow-hidden flex flex-col">
        {/* 상단 타이틀 영역 */}
        <div className="h-[80px] bg-[#D9D9D9] flex items-center relative px-6">
          <span className="absolute left-1/2 -translate-x-1/2 text-[29px] font-medium text-[#4F4F4F]">
            친구 검색
          </span>

          <button
            type="button"
            onClick={onClose}
            className="ml-auto text-[#555] hover:text-black"
            aria-label="close"
          >
            <IoMdClose size={38} />
          </button>
        </div>

        {/* 본문 영역 */}
        <div className="flex-1 flex flex-col bg-white">
          {/* 🔹 설명 + 인풋 + 선 */}
          <div className="flex flex-col items-center w-full pt-8 pb-4 px-8">
            <p className="text-[18px] text-[#4F4F4F] mb-4">
              추가하고 싶은 친구의 <b>닉네임</b>을 입력하세요
            </p>

            <div className="relative w-[80%] mb-6">
              <input
                type="text"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  setSearched(false);
                  setResult(null);
                  setRequestDone(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !searching) {
                    handleSearch();
                  }
                }}
                placeholder="닉네임을 입력해주세요."
                className="w-full bg-[#f0f0f0] rounded-full py-3 pl-5 pr-12 text-gray-700 focus:outline-none"
              />
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black"
                onClick={handleSearch}
                disabled={searching}
              >
                <AiOutlineSearch size={28} />
              </button>
            </div>

            {/* 위/아래를 나누는 전체 구분선 */}
            <div className="w-full h-[1px] bg-[#D9D9D9]" />
          </div>

          {/* 🔹 아래쪽 검색 결과 영역 (캡처처럼) */}
          <div className="flex-1 flex items-center justify-center px-16">
            {!searched ? (
              <p className="text-[#8f8f8f] text-sm">
                검색 결과가 여기에 표시됩니다.
              </p>
            ) : result === null ? (
              <p className="text-[#8f8f8f] text-sm">
                사용자를 찾을 수 없습니다
              </p>
            ) : (
              <div className="flex items-center justify-between w-full max-w-[87%]">
                <div className="flex items-center gap-8">
                  <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
                    {result.profileUrl ? (
                      <img
                        src={result.profileUrl}
                        alt={result.nickname}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-600 text-sm flex items-center justify-center w-full h-full">
                        <img
                          src={profileImg}
                          alt="프로필"
                          className="w-full h-full object-cover"
                        />
                      </span>
                    )}
                  </div>
                  <span className="font-medium text-black text-[23px]">
                    {result.nickname}
                  </span>
                </div>

                {requestDone ? (
                  <button
                    disabled
                    className="px-5 py-2 rounded-[8px] bg-gray-300 text-white text-sm font-semibold cursor-not-allowed"
                  >
                    신청 완료
                  </button>
                ) : (
                  <button
                    onClick={handleRequest}
                    disabled={requesting}
                    className="px-5 py-2 rounded-[8px] bg-[#34c759] text-white text-sm font-semibold hover:bg-[#2cab4c] disabled:opacity-60"
                  >
                    {requesting ? "신청 중..." : "친구 신청"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
