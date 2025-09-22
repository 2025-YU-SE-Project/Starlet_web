import React, { useEffect, useState } from "react";
import applyNewPassword from "../apis/applyNewPassword";
import emailVerificationStatusApi from "../apis/emailVerificationStatusApi";

const PasswordResetChange = ({
  email,
  lockEmail = true,
  setEmail,
  setMsg,
  setMsgColor,
  onSuccess,
}) => {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [changing, setChanging] = useState(false);


  const [verified, setVerified] = useState(false);
  const [checkLoading, setCheckLoading] = useState(false);

  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const isPwValid = pw.length >= 6 && pw.length <= 15;

 
  useEffect(() => {
    setVerified(false);
  }, [email]);

  // 인증 상태 확인
  const handleCheckVerification = async () => {
    const v = (email || "").trim();
    if (!v || !isValidEmail(v)) {
      setMsg("올바른 이메일 주소를 입력해주세요.");
      setMsgColor("#FF4D4F");
      return;
    }

    try {
      setCheckLoading(true);
      const { verifyType } = await emailVerificationStatusApi(v);

      
      if (verifyType === "CHANGING_PASSWORD") {
        setVerified(true);
        setMsg("비밀번호 재설정 인증이 완료되었습니다. 새 비밀번호를 입력해주세요.");
        setMsgColor("#54C65B");
      } else {
        setVerified(false);
        setMsg("메일함에서 인증 버튼을 누른 뒤 다시 확인해주세요.");
        setMsgColor("#FF4D4F");
      }
    } catch (err) {
      setVerified(false);
      setMsg(err?.response?.data?.message || "인증 상태 조회 중 오류가 발생했습니다.");
      setMsgColor("#FF4D4F");
      console.error("인증 상태 확인 오류:", err);
    } finally {
      setCheckLoading(false);
    }
  };

 
  const handleChangePassword = async () => {
    const v = (email || "").trim();
    if (!v || !isValidEmail(v)) {
      setMsg("올바른 이메일 주소를 입력해주세요.");
      setMsgColor("#FF4D4F");
      return;
    }
    if (!verified) {
      setMsg("비밀번호 재설정 인증이 완료되지 않았습니다. 먼저 '인증 상태 확인'을 눌러주세요.");
      setMsgColor("#FF4D4F");
      return;
    }
    if (!isPwValid) {
      setMsg("비밀번호는 6자 이상이어야 합니다.");
      setMsgColor("#FF4D4F");
      return;
    }
    if (pw !== pw2) {
      setMsg("비밀번호가 일치하지 않습니다.");
      setMsgColor("#FF4D4F");
      return;
    }

    try {
      setChanging(true);
      await applyNewPassword({ email: v, newPassword: pw });
      setMsg("비밀번호가 변경되었습니다. 로그인해주세요.");
      setMsgColor("#54C65B");
      onSuccess?.();
    } catch (err) {
      setMsg(err?.response?.data?.message || "비밀번호 변경에 실패했습니다. 메일 인증이 완료되었는지 확인해주세요.");
      setMsgColor("#FF4D4F");
      console.error("비밀번호 변경 오류:", err);
    } finally {
      setChanging(false);
    }
  };

  return (
    <div className="flex flex-col gap-[12px] mt-[32px] w-[554px]">
      <p className="text-[14px]">
        메일함에서 인증 버튼 을 누른 뒤, 아래에서 인증 상태 확인 버튼을 눌러주세요.
      </p>

      <div className="flex gap-2">
        <input
          type="email"
          placeholder="이메일 주소"
          className="flex w-[400px] h-[56px] border rounded-[5px] px-5 text-[18px]"
          value={email}
          onChange={(e) => setEmail?.(e.target.value)}
          disabled={lockEmail || checkLoading || changing}
        />
        <button
          type="button"
          onClick={handleCheckVerification}
          disabled={checkLoading || changing}
          className="w-[180px] h-[56px] text-[16px] border rounded-[5px] hover:bg-[#3E33DB] hover:text-white "
        >
          {checkLoading ? "확인 중..." : "인증 상태 확인"}
        </button>
      </div>

      <input
        type="password"
        placeholder="새 비밀번호 (6자 이상)"
        className="h-[56px] border rounded-[5px] px-5 text-[18px]"
        value={pw}
        onChange={(e) => setPw(e.target.value)}
        disabled={changing || !verified}
      />
      <input
        type="password"
        placeholder="새 비밀번호 확인"
        className="h-[56px] border rounded-[5px] px-5 text-[18px]"
        value={pw2}
        onChange={(e) => setPw2(e.target.value)}
        disabled={changing || !verified}
      />

      <button
        type="button"
        onClick={handleChangePassword}
        disabled={changing || !verified}
        className="h-[56px] text-[18px] bg-[#3E33DB] hover:bg-[#2519cc] rounded disabled:opacity-60"
      >
        {changing ? "변경 중..." : "비밀번호 변경"}
      </button>
    </div>
  );
};

export default PasswordResetChange;
