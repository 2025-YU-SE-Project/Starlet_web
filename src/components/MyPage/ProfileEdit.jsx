import React, { useState } from "react";
import { IoClose } from "react-icons/io5";
import profileImg from "../../assets/MyPage/profile.png";
import cameraIcon from "../../assets/MyPage/camera.png";
import nicknameCheckApi from "../../apis/nicknameCheckApi";

function ProfileEdit({ open, onClose, onComplete }) {
  const [nickname, setNickname] = useState("");
  const [checkMessage, setCheckMessage] = useState("");
  const [checkType, setCheckType] = useState(null);
  const [checking, setChecking] = useState(false);

  if (!open) return null;

  const handleComplete = () => {
    onComplete?.(nickname);
    onClose?.();
  };

  const handleCheckNickname = async () => {
    const trimmed = nickname.trim();

    if (trimmed.length < 2 || trimmed.length > 10) {
      setCheckMessage("닉네임은 2-10글자여야 합니다.");
      setCheckType("error");
      return;
    }

    try {
      setChecking(true);
      const res = await nicknameCheckApi(trimmed);

      if (res.available) {
        setCheckMessage("사용 가능한 닉네임입니다.");
        setCheckType("success");
      } else {
        setCheckMessage("중복된 닉네임입니다.");
        setCheckType("error");
      }
    } catch (e) {
      console.error(e);
      setCheckMessage("닉네임 확인 중 오류가 발생했습니다.");
      setCheckType("error");
    } finally {
      setChecking(false);
    }
  };

  const messageColor =
    checkType === "error"
      ? "text-red-500"
      : checkType === "success"
      ? "text-green-600"
      : "text-transparent";

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose?.();
        }}
      >
        <div
          className="w-full max-w-xl bg-[#F4F4F4] rounded-[20px] overflow-hidden"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-5 bg-[#D9D9D9]">
            <button
              type="button"
              onClick={onClose}
              className="text-[#7C7C7C] text-3xl cursor-pointer"
            >
              <IoClose />
            </button>
            <div className="text-xl font-semibold text-[#4A4A4A]">
              프로필 수정
            </div>
            <button
              type="button"
              onClick={handleComplete}
              className="text-lg font-medium text-[#4A4A4A] cursor-pointer"
            >
              완료
            </button>
          </div>

          <div className="px-12 pt-15 pb-11">
            <div className="flex justify-center mb-13">
              <div className="relative">
                <img
                  src={profileImg}
                  alt="프로필"
                  className="w-45 h-45 rounded-full object-cover"
                />
                <button
                  type="button"
                  className="absolute bottom-1 right-1 w-10 h-10 rounded-full p-0 border-none"
                >
                  <img
                    src={cameraIcon}
                    className="w-full h-full object-contain cursor-pointer"
                  />
                </button>
              </div>
            </div>

            <div className="mb-3 pl-1 text-[15px] text-[#4F4F4F]">
              새로운 닉네임
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  setCheckMessage("");
                  setCheckType(null);
                }}
                className="flex-1 h-12 rounded-[5px] border border-[#D1D1D1] bg-white px-4 text-[15px] text-[#3F3F3F] outline-none focus:border-[#AFAFAF]"
                placeholder="닉네임을 입력하세요."
              />
              <button
                type="button"
                onClick={handleCheckNickname}
                disabled={checking}
                className={`w-24 h-12 rounded-[5px] text-[14px] font-medium cursor-pointer ${
                  checking
                    ? "bg-[#BFBFBF] text-[#777777]"
                    : "bg-[#D9D9D9] text-[#555555] hover:bg-[#CFCFCF]"
                }`}
              >
                중복 확인
              </button>
            </div>

            <div className={`mt-2 pl-1 text-sm min-h-[20px] ${messageColor}`}>
              {checkMessage || " "}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProfileEdit;
