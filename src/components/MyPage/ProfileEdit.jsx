import React, { useState, useEffect, useRef } from "react";
import { IoClose } from "react-icons/io5";
import profileImg from "../../assets/MyPage/profile.png";
import cameraIcon from "../../assets/MyPage/camera.png";

import checkNickname from "../../apis/MyPage/checkNickname";
import changeNickname from "../../apis/MyPage/changeNickname";

import getTempUrl from "../../apis/MyPage/getTempUrl";
import changePfp from "../../apis/MyPage/changePfp";

function ProfileEdit({
  open,
  onClose,
  onComplete,
  currentNickname,
  currentProfileUrl,
}) {
  const [nickname, setNickname] = useState("");
  const [checkMessage, setCheckMessage] = useState("");
  const [checkType, setCheckType] = useState(null);
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);

  const [checkedNickname, setCheckedNickname] = useState("");

  const [previewUrl, setPreviewUrl] = useState(currentProfileUrl || profileImg);
  const [file, setFile] = useState(null);
  const [isDefaultSelected, setIsDefaultSelected] = useState(false);

  const [showImageMenu, setShowImageMenu] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (open) {
      const initial = currentNickname || "";
      setNickname(initial);
      setCheckMessage("");
      setCheckType(null);
      setCheckedNickname(initial);

      setPreviewUrl(currentProfileUrl || profileImg);
      setFile(null);
      setIsDefaultSelected(false);
      setShowImageMenu(false);
    }
  }, [open, currentNickname, currentProfileUrl]);

  if (!open) return null;

  const handleCompleteNickname = async () => {
    const trimmed = nickname.trim();
    const currentTrimmed = (currentNickname || "").trim();

    if (trimmed.length < 2 || trimmed.length > 10) {
      setCheckMessage("닉네임은 2~10글자여야 합니다.");
      setCheckType("error");
      return null;
    }

    if (trimmed === currentTrimmed) {
      return currentTrimmed;
    }

    if (checkType !== "success" || checkedNickname !== trimmed) {
      setCheckMessage("닉네임 중복 확인을 먼저 해주세요.");
      setCheckType("error");
      return null;
    }

    const res = await changeNickname(trimmed);
    return res?.nickname || trimmed;
  };

  const uploadProfileImage = async () => {
    try {
      if (isDefaultSelected) {
        const { profileUrl } = await changePfp("defaults");
        return profileUrl;
      }

      if (!file) {
        return null;
      }

      console.log("uploadProfileImage - file.type >>>", file.type);

      const { presignedUrl, tempKey } = await getTempUrl(file.type);
      console.log("받은 presignedUrl:", presignedUrl);
      console.log("받은 tempKey:", tempKey);

      const uploadRes = await fetch(presignedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      console.log("S3 업로드 응답 status >>>", uploadRes.status);

      if (!uploadRes.ok) {
        const errText = await uploadRes.text().catch(() => "");
        console.error("S3 업로드 실패 상세:", uploadRes.status, errText);
        throw new Error(
          `이미지 업로드에 실패했습니다. (S3 status: ${uploadRes.status})`
        );
      }

      const { profileUrl } = await changePfp(tempKey);
      return profileUrl;
    } catch (error) {
      console.error("uploadProfileImage 전체 에러:", error);
      throw error;
    }
  };

  const handleComplete = async () => {
    try {
      setSaving(true);

      const newNickname = await handleCompleteNickname();
      if (newNickname === null) {
        setSaving(false);
        return;
      }

      const newProfileUrl = await uploadProfileImage();

      onComplete?.({
        nickname: newNickname,
        profileUrl: newProfileUrl || previewUrl,
      });

      onClose?.();
    } catch (e) {
      console.error(e);
      setCheckMessage(e.message || "저장 중 오류가 발생했습니다.");
      setCheckType("error");
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    console.log("선택된 파일 >>>", f);
    console.log("file.type >>>", f.type);

    setFile(f);
    setIsDefaultSelected(false);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const handleOpenImageMenu = () => {
    setShowImageMenu((prev) => !prev);
  };

  const handleSelectImageFromLibrary = () => {
    setShowImageMenu(false);
    setIsDefaultSelected(false);
    fileInputRef.current?.click();
  };

  const handleSetDefaultImage = () => {
    setShowImageMenu(false);
    setIsDefaultSelected(true);
    setFile(null);
    setPreviewUrl(profileImg);
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
      setCheckMessage("");
      setCheckType(null);

      const res = await checkNickname(trimmed);
      setCheckedNickname(trimmed);

      if (res.available) {
        setCheckMessage("사용 가능한 닉네임입니다.");
        setCheckType("success");
      } else {
        setCheckMessage("중복된 닉네임입니다.");
        setCheckType("error");
      }
    } catch (e) {
      setCheckMessage(e.message || "닉네임 확인 중 오류가 발생했습니다.");
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
            <IoClose
              className="text-[#7C7C7C] text-3xl cursor-pointer"
              onClick={onClose}
            />
            <div className="text-xl font-semibold text-[#4A4A4A]">
              프로필 수정
            </div>

            <button
              type="button"
              onClick={handleComplete}
              disabled={saving}
              className={`text-lg font-medium cursor-pointer ${
                saving ? "text-[#A0A0A0]" : "text-[#4A4A4A]"
              }`}
            >
              완료
            </button>
          </div>

          <div
            className="px-12 pt-15 pb-11"
            onClick={() => setShowImageMenu(false)}
          >
            <div className="flex justify-center mb-13">
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <img
                  src={previewUrl}
                  alt="프로필"
                  className="w-45 h-45 rounded-full object-cover"
                />

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenImageMenu();
                  }}
                  className="absolute bottom-1 right-1 w-10 h-10 rounded-full cursor-pointer"
                >
                  <img
                    src={cameraIcon}
                    className="w-full h-full object-contain"
                    alt="카메라"
                  />
                </button>

                {showImageMenu && (
                  <div className="absolute top-41 left-43 w-32 rounded-lg bg-white text-black shadow-md border border-[#D1D1D1] z-10 overflow-hidden">
                    <button
                      type="button"
                      onClick={handleSelectImageFromLibrary}
                      className="w-full px-3 py-2 text-[13px] text-left hover:bg-[#F2F2F2] rounded-t-lg"
                    >
                      앨범에서 선택
                    </button>

                    <button
                      type="button"
                      onClick={handleSetDefaultImage}
                      className="w-full border-t border-[#E5E5E5] px-3 py-2 text-[13px] text-left hover:bg-[#F2F2F2] rounded-b-lg"
                    >
                      기본 이미지
                    </button>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
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
                {checking ? "확인 중..." : "중복 확인"}
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
