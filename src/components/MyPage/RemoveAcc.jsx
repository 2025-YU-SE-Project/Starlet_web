import React from "react";
import { IoClose } from "react-icons/io5";

function RemoveAcc({ open, status = "idle", onClose, onConfirm, onFinish }) {
  if (!open) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      if (status === "done") {
        onFinish?.();
      } else {
        onClose?.();
      }
    }
  };

  const handleCloseClick = () => {
    if (status === "done") {
      onFinish?.();
    } else {
      onClose?.();
    }
  };

  const handleNo = () => {
    onClose?.();
  };

  const handleYes = () => {
    onConfirm?.();
  };

  const handleOk = () => {
    onFinish?.();
  };

  const isDone = status === "done";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50"
      onClick={handleOverlayClick}
    >
      <div className="w-[520px] max-w-[90%] rounded-2xl bg-[#F4F4F4]">
        <div className="relative h-[48px] bg-[#D9D9D9] rounded-t-[20px] flex items-center justify-center">
          <button
            type="button"
            onClick={handleCloseClick}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4F4F4F] hover:text-black cursor-pointer"
          >
            <IoClose className="w-6 h-6" />
          </button>
        </div>

        <div className="px-10 py-8 text-center">
          {!isDone ? (
            <>
              <p className="text-[18px] text-[#333333] font-medium leading-relaxed mb-6">
                Starlet 계정을 탈퇴하시겠습니까?
                <br />
                탈퇴하면 계정 및 모든 기록이 삭제됩니다.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  type="button"
                  onClick={handleYes}
                  className="min-w-[80px] px-5 py-2 rounded-[8px] bg-[#D9D9D9] text-[15px] text-[#333333] font-medium hover:bg-[#C9C9C9] cursor-pointer"
                >
                  예
                </button>
                <button
                  type="button"
                  onClick={handleNo}
                  className="min-w-[80px] px-5 py-2 rounded-[8px] bg-[#D9D9D9] text-[15px] text-[#333333] font-medium hover:bg-[#C9C9C9] cursor-pointer"
                >
                  아니오
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-[18px] text-[#333333] font-medium leading-relaxed mb-6">
                계정 탈퇴가 완료되었습니다.
                <br />
                그동안 Starlet을 이용해주셔서 감사합니다.
              </p>
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleOk}
                  className="min-w-[80px] px-5 py-2 rounded-[8px] bg-[#D9D9D9] text-[15px] text-[#333333] font-medium hover:bg-[#C9C9C9] cursor-pointer"
                >
                  확인
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default RemoveAcc;
