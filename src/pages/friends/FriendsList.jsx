import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchFriendList } from "../../apis/Friends/friends";
import { FiTrash2 } from "react-icons/fi";
import { IoIosAdd } from "react-icons/io";
import { CiMenuBurger } from "react-icons/ci";
import background from "../../assets/background.png";
import Sidebar from "../../components/Sidebar";
import FriendRequestsModal from "../../components/FriendRequestModal";
import FriendSearchModal from "../../components/FriendSearchModal";
import { deleteFriend } from "../../apis/Friends/deleteFriend";
import profileImg from "../../assets/friendprofile.png";
import getUser from "../../apis/MyPage/getUser";
import getLevel from "../../apis/MyPage/getLevel";

export default function FriendsList() {
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [defaultUserImg, setDefaultUserImg] = useState(false);

  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState("");

  const [levelName, setLevelName] = useState("");
  const [levelError, setLevelError] = useState("");

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

  const handleDeleteFriend = async (id) => {
    const ok = window.confirm("정말 친구를 삭제할까요?");
    if (!ok) return;

    try {
      await deleteFriend(id);
      setFriends((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      console.error("친구 삭제 실패:", err);
      window.alert("친구 삭제에 실패했습니다.");
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        setLoading(true);
        setUserLoading(true);
        setUserError("");
        setLevelError("");

        const [friendsData, userData, levelData] = await Promise.all([
          fetchFriendList(controller.signal),
          getUser(),
          getLevel(),
        ]);

        const processedFriends = (friendsData || []).map((f) => {
          const base = normalizeProfileUrl(f.profileUrl);
          const version = f.profileUpdatedAt
            ? new Date(f.profileUpdatedAt).getTime()
            : f.updatedAt
            ? new Date(f.updatedAt).getTime()
            : Date.now();

          return {
            ...f,
            profileUrl: addCacheBust(base, version),
          };
        });

        setFriends(processedFriends);

        if (userData) {
          const base = normalizeProfileUrl(userData.profilePhotoUrl);
          const version = userData.updatedAt
            ? new Date(userData.updatedAt).getTime()
            : Date.now();

          const profileWithVersion = addCacheBust(base, version);

          setUser({
            ...userData,
            profilePhotoUrl: profileWithVersion,
          });
        } else {
          setUser(null);
        }

        const levelLabel = levelData?.name ?? levelData?.levelName ?? "";
        setLevelName(levelLabel);
      } catch (err) {
        if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") {
          return;
        }
        console.error("데이터 불러오기 실패:", err);

        if (err.message) {
          setUserError((prev) => prev || err.message);
        }
      } finally {
        setLoading(false);
        setUserLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, []);

  const friendCount = friends.length;

  function getProfileSrc(url) {
    if (!url) return profileImg;

    if (url.includes("default") || url.includes("basic") || url.trim() === "") {
      return profileImg;
    }
    return url;
  }

  return (
    <>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <button
        onClick={() => setIsSidebarOpen(true)}
        aria-label="open sidebar"
        className="fixed top-6 left-6 z-10"
      >
        <CiMenuBurger className="cursor-pointer text-white" size={30} />
      </button>

      <div className="fixed inset-0 w-screen h-screen overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${background})` }}
        />

        <div className="absolute inset-0 bg-gradient-to-b from-[#3f7bdc]/60 via-[#102854]/70 to-[#020617]/80" />

        <div className="relative z-10 w-full h-full text-white">
          <div className="max-w-[1400px] mx-auto h-full px-8 pt-4 pb-10 flex flex-col">
            <div className="flex justify-between items-start mb-10">
              <div className="flex flex-col">
                <h1 className="mt-12 text-[45px] font-bold tracking-tight">
                  친구 목록
                </h1>
              </div>
            </div>

            <section className="flex items-center gap-6 mb-8 flex-nowrap w-full">
              <div className="flex items-center gap-6 flex-1 min-w-0">
                <div className="w-[160px] h-[160px] rounded-full overflow-hidden shadow-md">
                  <img
                    src={getProfileSrc(user?.profilePhotoUrl)}
                    alt="프로필"
                    className={`w-full h-full object-cover object-center block transition-transform duration-200 ${
                      getProfileSrc(user?.profilePhotoUrl) === profileImg
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
                    style={defaultUserImg ? { transform: "scale(1.08)" } : {}}
                  />
                </div>

                <div className="flex flex-col leading-tight min-w-0">
                  <span className="text-[25px] truncate">
                    {(() => {
                      const level = userLoading
                        ? ""
                        : levelName || "별무리 탐험가";

                      const parts = level.split(" ");
                      const suffix = parts.pop();
                      const prefix = parts.join(" ");

                      return (
                        <span className="text-white font-semibold">
                          {prefix && (
                            <span className="text-white">{prefix}&nbsp;</span>
                          )}
                          <span className="text-white/70">{suffix}</span>
                        </span>
                      );
                    })()}
                  </span>

                  <span className="text-[35px] flex items-center overflow-hidden">
                    <span className="text-white font-bold truncate">
                      {userLoading ? "..." : user?.nickname || "익명"}
                    </span>
                    <span className="text-gray-300 font-medium ml-1 mr-5">
                      님
                    </span>
                    <span className="bg-[#54C65B] text-white font-bold text-[13px] px-3 py-[4px] rounded-md shadow-md relative top-[4px]">
                      ME
                    </span>
                  </span>

                  <div className="mt-4 inline-flex items-center rounded-[12px] bg-white/30 backdrop-blur px-5 py-1">
                    <div className="flex items-center gap-4 pr-5">
                      <span className="text-[14px] text-white/80">
                        기록된 별
                      </span>
                      <span className="text-[16px] font-semibold text-white">
                        {userLoading ? "-" : user?.totalStars ?? "-"}
                      </span>
                    </div>
                    <div className="h-6 w-px bg-white/30" />
                    <div className="flex items-center gap-4 pl-4">
                      <span className="text-[14px] text-white/80">
                        생성한 별자리
                      </span>
                      <span className="text-[16px] font-semibold text-white">
                        {userLoading ? "-" : user?.totalConstellations ?? "-"}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsRequestModalOpen(true)}
                    className="mt-4 text-left text-white text-[14px]"
                  >
                    <span className="inline-block border-b border-white hover:text-white/70 hover:border-white/70 transition cursor-pointer">
                      친구 요청 확인하기
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex-shrink-0">
                <button
                  type="button"
                  className="flex items-center w-[125px] justify-center bg-[#34c759] text-white font-semibold px-4 py-2 rounded-[8px] shadow-md hover:bg-[#2cab4c] transition"
                  onClick={() => setIsSearchModalOpen(true)}
                >
                  <IoIosAdd className="text-3xl" />
                  <span>친구 추가</span>
                </button>
              </div>
            </section>

            <div className="flex-1 flex flex-col min-h-0 mt-2">
              <span className="text-white text-[20px]">
                <span className="font-medium text-[#54C65B]">
                  {friendCount}
                </span>
                {" 명의 친구"}
              </span>

              <div className="flex items-center text-[18px] text-white border-b border-white/40 pb-2 px-6">
                <div className="w-[40%] flex items-center">
                  <span className="ml-[86px]">name</span>
                </div>
                <div className="w-[30%] flex items-center">
                  <span className="ml-[43px]">level</span>
                </div>
                <div className="w-[20%] flex items-center">
                  <span className="ml-[-3px]">total stars</span>
                </div>
                <div className="w-[35%] flex items-center">
                  <span className="ml-[-14px]">total constellations</span>
                </div>
                <div className="w-[40px]" />
              </div>

              <div className="mt-1 flex-1 overflow-y-auto">
                {loading ? (
                  <div className="py-10 text-center text-sm text-white/80">
                    친구 목록을 불러오는 중입니다...
                  </div>
                ) : friends.length === 0 ? (
                  <div className="py-10 text-center text-sm text-white/80">
                    아직 추가된 친구가 없습니다.
                  </div>
                ) : (
                  friends.map((friend) => (
                    <div
                      key={friend.id}
                      className="flex items-center px-6 py-4 border-b border-white/40 last:border-b-0 transition-colors"
                    >
                      <div className="w-[40%] flex items-center gap-8">
                        <div className="w-[52px] h-[52px] rounded-full overflow-hidden shadow-sm">
                          <img
                            src={getProfileSrc(friend.profileUrl)}
                            alt="프로필"
                            className={`w-full h-full object-cover object-center block transition-transform duration-200 ${
                              getProfileSrc(friend.profileUrl) === profileImg
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
                        </div>
                        <span className="text-[22px]">{friend.nickname}</span>
                      </div>

                      <div className="w-[30%] ml-15">
                        {(() => {
                          const level = friend.level || "탐험가";
                          const parts = level.split(" ");
                          const suffix = parts.pop();
                          const prefix = parts.join(" ");

                          return (
                            <span className="inline-flex items-center px-4 py-[4px] rounded-full bg-[#060817CC]/80 text-[18px]">
                              {prefix && (
                                <span className="text-white">
                                  {prefix}&nbsp;
                                </span>
                              )}
                              <span className="text-white/70">{suffix}</span>
                            </span>
                          );
                        })()}
                      </div>

                      <div className="w-[30%] text-[17px]">
                        <span className="text-[#54C65B] font-semibold ml-14">
                          {friend.totalStars}
                        </span>{" "}
                        <span className="text-white/70 text-[16px]">stars</span>
                      </div>

                      <div className="w-[40%] text-[17px]">
                        <span className="text-[#54C65B] font-semibold">
                          {friend.totalConstellations}
                        </span>{" "}
                        <span className="text-white/70 text-[16px]">
                          constellations
                        </span>
                      </div>

                      <div className="w-[50px] flex justify-center">
                        <button
                          className="w-12 h-12 rounded-full border border-white/40 flex items-center justify-center hover:bg-white/10"
                          onClick={() => handleDeleteFriend(friend.id)}
                        >
                          <FiTrash2 className="text-3xl" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <FriendRequestsModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
      />
      <FriendSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
    </>
  );
}
