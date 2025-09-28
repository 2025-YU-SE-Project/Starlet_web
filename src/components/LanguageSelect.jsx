import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const LANGS = [
  { code: "ko", label: "한국어", flag: "KR" },
  { code: "en", label: "English", flag: "US" },
];

export default function LanguageSelect() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  const current = LANGS.find(l => i18n.language?.startsWith(l.code)) || LANGS[0];


  const toggleMenu = () => setOpen(v => !v);


  const selectLang = (code) => {
    if (!i18n.language?.startsWith(code)) {
      i18n.changeLanguage(code);
    }
    setOpen(false);
  };


  useEffect(() => {
    const onDocClick = (e) => {
      if (!btnRef.current?.contains(e.target) && !menuRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={toggleMenu}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20
                   backdrop-blur border border-white/20 text-white"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="opacity-80">Select Language</span>
        <span className="text-sm">▼</span>
      </button>

      {open && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-2 w-56 rounded-2xl bg-white/10 backdrop-blur
                     border border-white/20 shadow-lg p-1 text-white"
          role="listbox"
        >
          {LANGS.map((l) => {
            const active = i18n.language?.startsWith(l.code);
            return (
              <button
                key={l.code}
                onClick={() => selectLang(l.code)} 
                role="option"
                aria-selected={active}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl
                           hover:bg-white/20 ${active ? "bg-white/20" : ""}`}
              >
                <span className="text-xl">{l.flag}</span>
                <span className="flex-1">{l.label}</span>
                {active && <span>✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
