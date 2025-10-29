import React from "react";

export default function RepresentativeConfirmModal({
  open,
  onClose,
  onConfirm,
  item,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120]">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                      bg-white text-neutral-900 w-[420px] max-w-[95vw] rounded-2xl shadow-2xl p-6">
        <div className="text-xl font-semibold mb-2">대표 별자리로 지정</div>
        <div className="text-neutral-600 mb-6">
          {item?.name ? `‘${item.name}’` : "선택한 별자리"}를 대표 별자리로 지정하시겠습니까?
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-neutral-200 hover:bg-neutral-300"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-[#FFD12B] hover:brightness-95 text-black"
          >
            예, 지정할게요
          </button>
        </div>
      </div>
    </div>
  );
}
