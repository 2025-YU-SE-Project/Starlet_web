import React, { useEffect, useState } from "react";

const ConstellationModal = ({ open, onClose, onSubmit, initial }) => {
  const [name, setName] = useState(initial?.name ?? "");
  const [desc, setDesc] = useState(initial?.desc ?? "");

  useEffect(() => {
    if (open) {
      setName(initial?.name ?? "");
      setDesc(initial?.desc ?? "");
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => (document.body.style.overflow = "");
  }, [open, initial]);

  if (!open) return null;

  const submit = () => onSubmit?.({ name: name.trim(), desc: desc.trim() });

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-5xl bg-white/90 rounded-2xl shadow-2xl p-6 md:p-8">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-black/60 hover:text-black"
          aria-label="닫기"
        >
          ←
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div className="rounded-xl bg-white/60 border border-black/10 p-3"></div>

          <div className="flex flex-col">
            <h2 className="text-2xl md:text-3xl font-extrabold text-black text-center md:text-left">
              별자리 이름을 지정해주세요
            </h2>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="미지정 별자리"
              className="mt-6 w-full rounded-lg bg-white px-4 py-3 outline-none border border-black/10 focus:border-black/30"
            />

            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="별자리에 대한 소개를 작성해주세요"
              rows={4}
              className="mt-3 w-full rounded-lg bg-white px-4 py-3 outline-none border border-black/10 focus:border-black/30 resize-none"
            />

            <button
              onClick={submit}
              className="mt-6 self-center md:self-start px-10 py-2 rounded-lg bg-green-800 text-white font-semibold hover:bg-green-700"
            >
              설 정
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConstellationModal;
