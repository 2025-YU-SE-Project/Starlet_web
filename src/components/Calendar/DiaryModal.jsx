import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { IoClose } from "react-icons/io5";
import imgBlue from "../../assets/emotions/blue.png";
import imgOrange from "../../assets/emotions/orange.png";
import imgRed from "../../assets/emotions/red.png";
import imgGreen from "../../assets/emotions/green.png";
import imgPurple from "../../assets/emotions/purple.png";
import imgYellow from "../../assets/emotions/yellow.png";
import calendarIcon from "../../assets/emotions/calendar.png";
import emotionIcon from "../../assets/emotions/emotion.png";
import tagIcon from "../../assets/emotions/tag.png";
import starBg from "../../assets/emotions/starbg.png";
import backIcon from "../../assets/emotions/back.png";

const STICKER = {
  funny: imgOrange,
  angry: imgRed,
  wow: imgPurple,
  happy: imgYellow,
  neutral: imgGreen,
  crying: imgBlue,
};

const EMOTION_KO = {
  funny: "웃겨요",
  angry: "화나요",
  wow: "놀라워요",
  happy: "행복해요",
  neutral: "잘 모르겠어요",
  crying: "슬퍼요",
};

function parseDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return {
    pretty: `${y}년 ${String(m).padStart(2, "0")}월 ${String(day).padStart(
      2,
      "0"
    )}일`,
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
  const [showConfirm, setShowConfirm] = useState(false);
  const [compactTextArea, setCompactTextArea] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const tagsBoxRef = useRef(null);
  const navigate = useNavigate();
  const parsed = parseDate(dateStr);
  const displayName = userName || "사용자";

  useEffect(() => {
    if (open) {
      setText(initialText || "");
      setErrorMsg("");
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

  useEffect(() => {
    if (!open) return;
    if (!tagsBoxRef.current) return;
    const h = tagsBoxRef.current.offsetHeight;
    setCompactTextArea(h > 40);
  }, [open, tags]);

  if (!open) return null;

  const len = text.trim().length;
  const valid = len >= 15 && len <= 300;

  const handleClickDone = async () => {
    if (!valid) return;
    setErrorMsg("");

    try {
      await onSave?.(text);

      if (isEdit) {
        onClose?.();
      } else {
        setShowConfirm(true);
      }
    } catch (e) {
      setErrorMsg(e?.message || "일기 저장 중 오류가 발생했습니다.");
    }
  };

  const handleConfirmYes = () => {
    setShowConfirm(false);
    onClose?.();
    navigate("/starsky");
  };

  const handleConfirmNo = () => {
    setShowConfirm(false);
    onClose?.();
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60" onClick={onClose} />

      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose?.();
        }}
      >
        <div
          className="w-full max-w-[672px] h-[635px] rounded-[20px] bg-[#F4F4F4] text-black shadow-lg p-6 overflow-hidden flex flex-col"
          onMouseDown={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          <div className="relative h-[56px] bg-[#D9D9D9] flex items-center justify-center rounded-t-[20px] -mt-6 -mx-6 px-6">
            {!isEdit && (
              <button
                onClick={onBack}
                className="absolute left-4 top-1/2 -translate-y-1/2 hover:opacity-80"
              >
                <img
                  src={backIcon}
                  alt="back"
                  className="w-4 h-4 object-contain cursor-pointer"
                  draggable={false}
                />
              </button>
            )}
            <div className="text-xl font-semibold">
              <span className="text-[#4F4F4F]">{displayName}</span>{" "}
              <span className="text-[#939393]">의 Diary</span>
            </div>
            <button
              onClick={handleClickDone}
              disabled={!valid}
              className={`absolute right-4 top-1/2 -translate-y-1/2 rounded-xl px-3 py-1 font-medium transition cursor-pointer ${
                valid ? "text-[#4F4F4F] hover:text-black" : "text-[#9CA3AF]"
              }`}
            >
              완료
            </button>
          </div>

          <div className="flex-1 pt-6 pb-2 overflow-y-auto">
            <div className="text-lg font-semibold text-[#4F4F4F] mb-3 ml-5 pb-1">
              ★ Overview
            </div>

            <div className="flex gap-5">
              <div
                className="rounded-[20px] w-[220px] h-[220px] relative overflow-hidden ml-5"
                style={{
                  backgroundImage: `url(${starBg})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <svg
                  viewBox="0 0 220 220"
                  className="w-full h-full"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <filter
                      id="star-glow"
                      x="-50%"
                      y="-50%"
                      width="200%"
                      height="200%"
                    >
                      <feGaussianBlur
                        in="SourceGraphic"
                        stdDeviation="2.5"
                        result="b1"
                      />
                      <feGaussianBlur
                        in="SourceGraphic"
                        stdDeviation="2.0"
                        result="b2"
                      />
                      <feMerge>
                        <feMergeNode in="b1" />
                        <feMergeNode in="b2" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {emotionId && STICKER[emotionId] && (
                    <g>
                      <image
                        href={STICKER[emotionId]}
                        x={110 - 20}
                        y={110 - 20}
                        width="40"
                        height="40"
                        filter="url(#star-glow)"
                        className="animate-pulse [animation-duration:1000ms]"
                        style={{
                          transformOrigin: "center",
                          transformBox: "fill-box",
                        }}
                      />
                      <circle cx="110" cy="110" r="2.5" fill="#ffffff" />
                    </g>
                  )}
                </svg>
              </div>

              <div className="flex-1 flex flex-col gap-3 text-[#4F4F4F]">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mt-2 ml-1">
                    <img
                      src={calendarIcon}
                      alt="date"
                      className="w-6 h-6 opacity-90"
                    />
                    <div className="font-bold">생성 날짜</div>
                  </div>
                  <div className="text-sm mt-2 ml-1">
                    {parsed ? parsed.pretty : ""}
                  </div>
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-2 ml-1 mt-1">
                    <img
                      src={emotionIcon}
                      alt="emotion"
                      className="w-7 h-7 opacity-90"
                    />
                    <div className="font-bold">감정</div>
                  </div>
                  <div className="text-sm mt-1 ml-1">
                    {EMOTION_KO[emotionId] || ""}
                  </div>
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-2 ml-1 mt-1">
                    <img
                      src={tagIcon}
                      alt="tags"
                      className="w-7 h-7 opacity-90"
                    />
                    <div className="font-bold">태그</div>
                  </div>
                  <div
                    ref={tagsBoxRef}
                    className="mt-2 ml-1 flex flex-wrap gap-2"
                  >
                    {tags.map((t, i) => (
                      <span
                        key={`${t}-${i}`}
                        className="px-3 py-2 rounded-full bg-[#D9D9D9] border border-[#D9D9D9] text-[12px] text-[#4F4F4F] leading-none"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <div className="rounded-[12px] border border-[#B0B0B0] bg-white px-3 py-2">
                <textarea
                  maxLength={300}
                  className={`w-full resize-none outline-none text-sm leading-[1.4] text-[#4F4F4F] placeholder-[#B0B0B0] ${
                    compactTextArea
                      ? "min-h-[140px] max-h-[180px]"
                      : "min-h-[180px] max-h-[220px]"
                  }`}
                  placeholder="오늘 하루를 기록해주세요"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <div className="flex justify-between items-center text-[11px] text-[#9F9F9F] mt-1">
                  <span className="text-[11px] text-red-500">
                    {errorMsg || ""}
                  </span>
                  <span>{len < 15 ? "최소 15자 이상" : `${len}/300`}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="w-[520px] max-w-[90%] rounded-2xl bg-[#F4F4F4]">
            <div className="relative h-[48px] bg-[#D9D9D9] rounded-t-[20px] flex items-center justify-center">
              <button
                type="button"
                onClick={handleConfirmNo}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4F4F4F] hover:text-black cursor-pointer"
              >
                <IoClose className="w-6 h-6" />
              </button>
            </div>

            <div className="px-10 py-8 text-center">
              <p className="text-[18px] text-[#333333] font-medium leading-relaxed mb-6">
                별 생성이 완료되었습니다.
                <br />
                밤하늘로 이동하시겠습니까?
              </p>

              <div className="flex justify-center gap-4">
                <button
                  type="button"
                  onClick={handleConfirmYes}
                  className="min-w-[80px] px-5 py-2 rounded-[8px] bg-[#D9D9D9] text-[15px] text-[#333333] font-medium hover:bg-[#C9C9C9] cursor-pointer"
                >
                  예
                </button>
                <button
                  type="button"
                  onClick={handleConfirmNo}
                  className="min-w-[80px] px-5 py-2 rounded-[8px] bg-[#D9D9D9] text-[15px] text-[#333333] font-medium hover:bg-[#C9C9C9] cursor-pointer"
                >
                  아니오
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DiaryModal;
