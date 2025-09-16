import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PasswordResetRequest from "../components/PasswordResetRequest";
import PasswordResetChange from "../components/PasswordResetChange";

const FoundPassword = () => {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [msgColor, setMsgColor] = useState("#FFFFFF");
  const [mailSent, setMailSent] = useState(false);

  const navigate = useNavigate();

  return (

    <div className="flex flex-col items-center text-white">
      <span className="text-[90px] font-julius mt-[147px] text-white">STARLET</span>
      <span className="mt-[2px] text-[23px] text-white">비밀번호 찾기</span>


      {!mailSent ? (
        <PasswordResetRequest
          email={email}
          setEmail={setEmail}
          setMsg={setMsg}
          setMsgColor={setMsgColor}
          onAfterSend={() => setMailSent(true)}
        />
      ) : (
        <PasswordResetChange
          email={email}
          lockEmail={true}
          setEmail={setEmail}
          setMsg={setMsg}
          setMsgColor={setMsgColor}
          onSuccess={() => setTimeout(() => navigate("/signin"), 800)}
        />
      )}

  
      <div
        className="mt-[10px] w-[554px] min-h-[20px] text-[14px] flex justify-start"
        style={{ color: msgColor }}
        role="status"
        aria-live="polite"
      >
        {msg || "\u00A0"}
      </div>

      <button
        type="button"
        className="underline text-[16px] mt-[24px] hover:font-bold text-white"
        onClick={() => navigate("/signin")}
      >
        로그인으로 돌아가기
      </button>
    </div>
  );
};

export default FoundPassword;
