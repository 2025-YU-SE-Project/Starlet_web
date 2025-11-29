import React from "react";
import img10 from "../../assets/img10.png"

export default function RepresentativeConfirmModal({
  open,
  onClose,
  onConfirm,
    item,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120]">

      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />


      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                   w-[420px] rounded-2xl shadow-2xl bg-[#F2F2F2] overflow-hidden"
      >
   
<div className="flex items-center justify-between px-4 py-3 bg-[#E3E3E3]">

  <div className="flex items-center">
    <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
      <img
        src={img10}
        alt="STARLET"
        className="w-6 h-6 object-contain"
      />
    </div>
  </div>


  <button
    onClick={onClose}
    aria-label="닫기"
    className="
      flex items-center justify-center 
      w-8 h-8 font-bold                 
      text-[30px] leading-none
      text-[#444] hover:text-black cursor-pointer
    "
  >
    ×
  </button>
</div>


   
        <div className="bg-white px-10 py-6 text-center">
          <p className="text-[17px] text-[#000000] leading-relaxed font-pretendard">
           <span className="font-bold">{item?.name ? `${item.name}` : "선택한 별자리"}</span>를 대표 별자리로 <br/> 설정하시겠습니까?
          </p>

          <div className="flex justify-center gap-4 mt-6 font-pretendard text=[13px]">
            <button
              onClick={onConfirm}
              className="min-w-[90px] px-5 py-2 rounded-md bg-[#E3E3E3] text-[#222]
                         hover:bg-[#D5D5D5]"
            >
              예
            </button>
            <button
              onClick={onClose}
              className="min-w-[90px] px-5 py-2 rounded-md bg-[#E3E3E3] text-[#222]
                         hover:bg-[#D5D5D5]"
            >
              아니오
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}