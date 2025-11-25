import React, { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { fetchFriendRequests } from "../apis/Friends/friendRequests";
import { acceptFriendRequest } from "../apis/Friends/accept";
import { rejectFriendRequest } from "../apis/Friends/reject";
import profileImg from "../assets/MyPage/profile.png";

export default function FriendRequestsModal({ isOpen, onClose }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    const controller = new AbortController();

    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchFriendRequests(controller.signal);
        setRequests(data || []);
      } catch (err) {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          console.error("친구 요청 목록 불러오기 실패:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [isOpen]);

  const handleAccept = async (id) => {
    try {
      setActionLoadingId(id);
      await acceptFriendRequest(id);
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("친구 요청 수락 실패:", err);
      window.alert("친구 요청 수락에 실패했습니다.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id) => {
    try {
      setActionLoadingId(id);
      await rejectFriendRequest(id);
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("친구 요청 거절 실패:", err);
      window.alert("친구 요청 거절에 실패했습니다.");
    } finally {
      setActionLoadingId(null);
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

      <div className="relative z-10 w-[75vw] max-w-[900px] h-[70vh] bg-[#f5f5f5] rounded-[18px] shadow-xl flex flex-col overflow-hidden">
        <div className="h-[80px] bg-[#D9D9D9] flex items-center relative px-6">
          <span className="absolute left-1/2 -translate-x-1/2 text-[29px] font-medium text-[#4F4F4F]">
            친구 요청
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

        <div className="flex-1 overflow-y-auto bg-white">
          {loading ? (
            <div className="py-10 text-center text-sm text-gray-500">
              친구 요청을 불러오는 중입니다...
            </div>
          ) : requests.length === 0 ? (
            <div className="py-10 text-center text-[18px] text-gray-500">
              친구 요청이 없습니다.
            </div>
          ) : (
            requests.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between px-10 py-5 border-b-[1px] border-[#D9D9D9]"
              >
                <div className="flex items-center gap-7">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                    {req.profileUrl ? (
                      <img
                        src={req.profileUrl}
                        alt={req.nickname}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg">
                        <img
                          src={profileImg}
                          alt="프로필"
                          className="w-full h-full object-cover"
                        />
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-[24px] font-semibold text-black">
                      {req.nickname}
                    </span>
                    {req.ddayLabel && (
                      <span className="text-[17px] font-semibold text-[#FF0000]">
                        {req.ddayLabel}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    className="min-w-[50px] h-[40px] px-5 rounded-[8px] bg-[#34c759] text-white text-[16px] font-semibold hover:bg-[#2cab4c] disabled:opacity-60"
                    onClick={() => handleAccept(req.id)}
                    disabled={actionLoadingId === req.id}
                  >
                    {actionLoadingId === req.id ? "..." : "수락"}
                  </button>
                  <button
                    type="button"
                    className="min-w-[0px] h-[40px] px-5 rounded-[8px] bg-[#ff3b30] text-white text-[16px] font-semibold hover:bg-[#e2332a]"
                    onClick={() => handleReject(req.id)}
                  >
                    거절
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
