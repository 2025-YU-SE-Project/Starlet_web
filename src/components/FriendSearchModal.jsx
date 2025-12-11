import React, { useState } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import { IoMdClose } from "react-icons/io";
import { searchFriend } from "../apis/Friends/search";
import { requestFriend } from "../apis/Friends/request";
import profileImg from "../assets/MyPage/profile.png";
import img10 from "../assets/img10.png";

export default function FriendSearchModal({ isOpen, onClose }) {
  const [nickname, setNickname] = useState("");
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [result, setResult] = useState(null);
  const [requesting, setRequesting] = useState(false);
  const [defaultUserImg, setDefaultUserImg] = useState(false);

  const normalizeProfileUrl = (rawUrl) => {
    const serverProfileUrl = rawUrl || "";
    if (!serverProfileUrl) return profileImg;

    if (
      serverProfileUrl.includes("default") ||
      serverProfileUrl.includes("basic") ||
      serverProfileUrl.includes("/public/defaults/")
    ) {
      return profileImg;
    }

    return serverProfileUrl;
  };

  const addCacheBust = (url, version) => {
    if (!url) return url;
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}_v=${version}`;
  };

  const handleSearch = async () => {
    if (!nickname.trim()) return;
    try {
      setSearching(true);
      const data = await searchFriend(nickname);

      if (data) {
        const base = normalizeProfileUrl(data.profileUrl);
        const version = data.profileUpdatedAt
          ? new Date(data.profileUpdatedAt).getTime()
          : data.updatedAt
          ? new Date(data.updatedAt).getTime()
          : Date.now();

        const processed = {
          ...data,
          profileUrl: addCacheBust(base, version),
        };
        setResult(processed);
      } else {
        setResult(null);
      }

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

      setResult((prev) => (prev ? { ...prev, status: "PENDING" } : prev));
    } catch (err) {
      console.error("친구 신청 실패:", err);
      alert("친구 신청 중 오류가 발생했습니다.");
    } finally {
      setRequesting(false);
    }
  };

  function getProfileSrc(url) {
    if (!url) return profileImg;

    if (url.includes("default") || url.includes("basic") || url.trim() === "") {
      return profileImg;
    }
    return url;
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-[800px] bg-[#f5f5f5] h-[42vh] rounded-[18px] shadow-xl overflow-hidden flex flex-col">
        <div className="h-[80px] bg-[#D9D9D9] flex items-center relative">
          <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center ml-6">
            <img
              src={img10}
              alt="STARLET"
              className="w-12 h-12 object-contain"
            />
          </div>

          <span className="absolute left-1/2 -translate-x-1/2 text-[29px] font-medium text-[#4F4F4F]">
            친구 검색
          </span>

          <button
            type="button"
            onClick={onClose}
            className="ml-auto text-[#555] hover:text-black mr-4"
            aria-label="close"
          >
            <IoMdClose size={38} />
          </button>
        </div>

        <div className="flex-1 flex flex-col bg-white">
          <div className="flex flex-col items-center w-full pt-8 pb-4 px-8">
            <p className="text-[18px] text-[#4F4F4F] mb-1">
              추가하고 싶은 친구의{" "}
              <span className="border-b-2 border-[#4F4F4F] font-bold">
                닉네임
              </span>
              을 입력하세요
            </p>

            <div className="relative w-[80%] mb-6">
              <input
                type="text"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  setSearched(false);
                  setResult(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !searching) {
                    handleSearch();
                  }
                }}
                placeholder="닉네임을 입력해주세요."
                className="w-full bg-[#f0f0f0] rounded-[12px] py-3 pl-5 pr-12 text-gray-700 focus:outline-none"
              />
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black cursor-pointer "
                onClick={handleSearch}
                disabled={searching}
              >
                <AiOutlineSearch size={30} />
              </button>
            </div>

            <div className="w-full h-[1px] bg-[#D9D9D9]" />
          </div>

          <div className="flex items-center justify-center px-16 mt-4">
            {!searched ? (
              <p className="text-[#8f8f8f] text-sm">
                사용자를 찾을 수 없습니다.
              </p>
            ) : result === null ? (
              <p className="text-[#8f8f8f] text-sm">
                사용자를 찾을 수 없습니다.
              </p>
            ) : (
              <div className="flex items-center justify-between w-full max-w-[87%]">
                <div className="flex items-center gap-8">
                  <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
                    {result.profileUrl ? (
                      <img
                        src={getProfileSrc(result?.profileUrl)}
                        alt="프로필"
                        className={`w-full h-full object-cover object-center block transition-transform duration-200 ${
                          getProfileSrc(result?.profileUrl) === profileImg
                            ? "scale-105"
                            : ""
                        }`}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = profileImg;
                        }}
                        onLoad={(e) => {
                          const isDef =
                            e.currentTarget.src.includes("friendprofile");
                          setDefaultUserImg(isDef);
                        }}
                        style={
                          defaultUserImg ? { transform: "scale(1.08)" } : {}
                        }
                      />
                    ) : (
                      <img
                        src={profileImg}
                        alt="프로필"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <span className="font-medium text-black text-[23px]">
                    {result.nickname}
                  </span>
                </div>

                {(() => {
                  const status = result.status;

                  if (status === "NONE") {
                    return (
                      <button
                        onClick={handleRequest}
                        disabled={requesting}
                        className="px-5 py-2  cursor-pointer  rounded-[8px] bg-[#34c759] text-white text-sm font-semibold hover:bg-[#2cab4c] disabled:opacity-60"
                      >
                        {requesting ? "신청 중..." : "친구 신청"}
                      </button>
                    );
                  }

                  if (status === "PENDING") {
                    return (
                      <button
                        disabled
                        className="px-5 py-2 rounded-[8px] bg-gray-300 text-white text-sm font-semibold cursor-not-allowed"
                      >
                        신청 완료
                      </button>
                    );
                  }

                  if (status === "ACCEPTED") {
                    return (
                      <button
                        disabled
                        className="px-5 py-2 rounded-[8px] bg-gray-300 text-white text-sm font-semibold cursor-not-allowed"
                      >
                        이미 친구입니다
                      </button>
                    );
                  }

                  return null;
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
