import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import backIcon from "../assets/back.png";
import imgBlue from "../assets/emotions/blue.png";
import imgOrange from "../assets/emotions/orange.png";
import imgRed from "../assets/emotions/red.png";
import imgGreen from "../assets/emotions/green.png";
import imgPurple from "../assets/emotions/purple.png";
import imgYellow from "../assets/emotions/yellow.png";

const STICKER = {
  funny: imgOrange,
  angry: imgRed,
  wow: imgPurple,
  happy: imgYellow,
  neutral: imgGreen,
  crying: imgBlue,
};

const MONTH_ABBR = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

function parseDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) return null;
  return {
    y: d.getFullYear(),
    m: d.getMonth(),
    d: d.getDate(),
    mm: String(d.getMonth() + 1).padStart(2, "0"),
    dd: String(d.getDate()).padStart(2, "0"),
  };
}

function DiaryModal({
  open,
  dateStr = "",
  emotionId,
  initialText = "",
  isEdit = false,
  onClose,
  onSave,
  userName = "",
  onBack,
  tags = [],
}) {
  const [text, setText] = useState(initialText);
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const parsed = parseDate(dateStr);

  useEffect(() => {
    if (open) {
      setText(initialText || "");
    }
  }, [open, initialText]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, [open]);

  if (!open) return null;
  const valid = text.trim().length >= 15 && text.trim().length <= 300;
  const handleClickDone = () => {
    if (!valid) return;
    if (isEdit) {
      onSave?.(text, tags);
      onClose?.();
    } else {
      setShowConfirm(true);
    }
  };

  const handleConfirmYes = async () => {
    try {
      await onSave?.(text, tags);
      setShowConfirm(false);
      onClose?.();
      navigate("/starsky");
    } catch (e) {
      console.error(e);
    }
  };

  const handleConfirmNo = () => {
    onSave?.(text, tags);
    setShowConfirm(false);
    onClose?.();
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60" onClick={onClose} />
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose?.();
        }}
      >
        <div
          className="w-full max-w-5xl max-h-[90vh] overflow-auto rounded-[10px] bg-[#F4F4F4]"
          onMouseDown={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          <div className="relative px-12 pt-7 pb-4">
            {!isEdit && (
              <button onClick={onBack} className="absolute left-6 top-7">
                <img
                  src={backIcon}
                  alt="뒤로가기"
                  className="w-6 h-6 cursor-pointer"
                />
              </button>
            )}

            <button
              onClick={handleClickDone}
              className={`absolute right-10 top-7 text-[20px] font-medium ${
                valid
                  ? "text-[#18315D] hover:opacity-80 cursor-pointer"
                  : "text-[#808080]"
              }`}
              disabled={!valid}
            >
              완료
            </button>
          </div>

          <div className="mt-3">
            <div className="px-12 pt-2">
              <span className="font-semibold text-[45px] text-gray-900 uppercase pl-7">
                {parsed ? `${MONTH_ABBR[parsed.m]} ${parsed.y}` : ""}
              </span>
              <span className="flex items-baseline gap-2 mt-1  pl-7">
                <span className="text-[32px] font-semibold text-[#808080]/55">
                  {parsed ? `${parsed.mm}/${parsed.dd}` : ""}
                </span>
                <span className="text-[25px] font-medium text-[#808080]/55 px-3">
                  {userName || "사용자"}의 일기장
                </span>
              </span>
              <div className="w-full h-[2.5px] bg-[#808080]/55 mt-4" />
            </div>

            <div className="px-8 pb-8 mt-5">
              <div className="grid grid-cols-2 gap-8 items-center">
                <div className="flex flex-col items-center">
                  {emotionId && STICKER[emotionId] && (
                    <img
                      src={STICKER[emotionId]}
                      className="w-24 h-24 object-contain drop-shadow-md"
                      draggable={false}
                      alt=""
                    />
                  )}

                  <div className="mt-6 flex flex-wrap gap-3 justify-center max-w-[300px] mx-auto">
                    {tags.map((t) => (
                      <span
                        key={t}
                        className="px-5 py-1 rounded-[10px] bg-[#D9D9D9] text-black text-[15px]"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    maxLength={300}
                    className="w-[95%] min-h-[330px] rounded-[10px] border border-gray-600 bg-white p-4 text-gray-800 outline-none focus:border-gray-600 shadow-inner pr-16"
                    placeholder="오늘 하루는 어땠나요?"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                  <div className="absolute bottom-3 right-9 text-sm text-gray-500">
                    {text.trim().length < 15
                      ? "최소 15자 이상"
                      : `${text.trim().length}/300`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50">
          <div className="bg-[#D9D9D9] rounded-[10px] p-14 w-[500px] h-[170px] text-center">
            <p className="text-[18px] text-black font-semibold mb-4">
              별이 생성되었습니다. 밤하늘로 이동하시겠습니까?
            </p>
            <div className="flex justify-end">
              <button
                className="text-[15px] px-3 py-2 rounded-[10px] font-semibold text-[#18315D] hover:opacity-90"
                onClick={handleConfirmYes}
              >
                예
              </button>
              <button
                className="text-[15px] px-3 py-2 rounded-[10px] font-semibold text-[#18315D] hover:opacity-80"
                onClick={handleConfirmNo}
              >
                아니오
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DiaryModal;
