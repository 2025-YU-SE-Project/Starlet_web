import React, { useState } from "react";
import requestResetPassword from "../apis/requestResetPassword";

const PasswordResetRequest = ({
  email,
  setEmail,
  setMsg,
  setMsgColor,
  onAfterSend,
}) => {
  const [loading, setLoading] = useState(false);
  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleSendMail = async (e) => {
    e.preventDefault();
    const v = email.trim();

    if (!v || !isValidEmail(v)) {
      setMsg("올바른 이메일 주소를 입력해주세요.");
      setMsgColor("#FF4D4F");
      return;
    }

    try {
      setLoading(true);
      await requestResetPassword(v);
      setMsg("인증 메일을 보냈습니다");
      setMsgColor("#54C65B");
      onAfterSend?.(); 
    } catch (err) {
      setMsg(err?.response?.data?.message || "오류가 발생했습니다.");
      setMsgColor("#FF4D4F");
      console.error("비밀번호 재설정 요청 오류:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSendMail} className="flex flex-col gap-[20px] mt-[40px]">
      <input
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setMsg("");
        }}
        placeholder="가입한 이메일 주소"
        className="w-[554px] h-[66px] border rounded-[5px] px-5 text-[20px]"
        disabled={loading}
      />

      <button
        type="submit"
        disabled={loading}
        className="w-[554px] h-[66px] text-[20px] bg-[#3E33DB] hover:bg-[#2519cc] disabled:opacity-60"
      >
        {loading ? "요청 중..." : "비밀번호 재설정 메일 보내기"}
      </button>
    </form>
  );
};

export default PasswordResetRequest;
