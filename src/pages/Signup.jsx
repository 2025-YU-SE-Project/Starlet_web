import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { GoArrowLeft } from "react-icons/go";
import signUpApi from "../apis/signUpApi";
import emailCheckApi from "../apis/emailCheckApi";
import nicknameCheckApi from "../apis/nicknameCheckApi";
import emailInitApi from "../apis/emailInitApi";
import emailVerificationStatusApi from "../apis/emailVerificationStatusApi";

const Signup = () => {
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const verifiedFlag = search.get("verified"); 


  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [checkpassword, setCheckpassword] = useState("");


  const [emailMsg, setEmailMsg] = useState("");
  const [emailMsgColor, setEmailMsgColor] = useState("#FF0000");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailInitSent, setEmailInitSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);


  const [nicknameMsg, setNicknameMsg] = useState("");

  useEffect(() => {
    const confirmByStatus = async () => {
      
      if (verifiedFlag === "done" && email.trim()) {
        try {
          const { verifyType } = await emailVerificationStatusApi(email.trim());
          if (verifyType === "VERIFY") {
            setEmailVerified(true);
            setEmailMsg("이메일 인증이 완료되었습니다.");
            setEmailMsgColor("#54C65B");
          } else {
            setEmailVerified(false);
            setEmailMsg("인증 상태 확인에 실패했어요. 이메일의 인증 버튼을 누른 뒤 다시 시도해 주세요.");
            setEmailMsgColor("#FF0000");
          }
        } catch (e) {
          setEmailVerified(false);
          setEmailMsg("인증 상태 조회 중 오류가 발생했습니다.");
          setEmailMsgColor("#FF0000");
        }
      }
    };
   confirmByStatus();
  }, [verifiedFlag, email]);

  const handleNicknameCheck = async () => {
    const v = nickname.trim();
    if (!v) {
      setNicknameMsg("닉네임을 입력해주세요.");
      return;
    }
    try {
      const result = await nicknameCheckApi(v);
      setNicknameMsg(result?.available ? "사용 가능한 닉네임입니다." : "중복된 닉네임입니다.");
    } catch (err) {
      console.error("닉네임 중복 확인 오류:", err);
      setNicknameMsg("닉네임 확인 오류가 발생했습니다.");
    }
  };

  const handleEmailCheck = async () => {
    const v = email.trim();
    if (!v) {
      setEmailMsg("이메일을 입력해주세요.");
      setEmailMsgColor("#FF0000");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      setEmailMsg("이메일 형식이 올바르지 않습니다.");
      setEmailMsgColor("#FF0000");
      return;
    }
    try {
      setEmailLoading(true);

      const result = await emailCheckApi(v);
      if (result?.available) {
    
        await emailInitApi(v);
        setEmailInitSent(true);
        setEmailMsg("인증 메일을 보냈습니다. 메일함에서 인증을 완료한 뒤, 아래 '인증 완료'를 눌러주세요.");
        setEmailMsgColor("#54C65B");
      } else {

        setEmailInitSent(false);
        setEmailMsg("중복된 이메일입니다.");
        setEmailMsgColor("#FF0000");
      }
    } catch (err) {
      console.error("이메일 확인/발송 오류:", err);
      setEmailMsg("이메일 확인/발송 중 오류가 발생했습니다.");
      setEmailMsgColor("#FF0000");
    } finally {
      setEmailLoading(false);
    }
  };


   const handleEmailConfirm = async () => {
    const v = email.trim();
    if (!v) return;
    try {
      setEmailLoading(true);
      const { verifyType, verifyExpireAt } = await emailVerificationStatusApi(v);
      if (verifyType === "VERIFY") {
        setEmailVerified(true);
        setEmailMsg("이메일 인증이 완료되었습니다.");
        setEmailMsgColor("#54C65B");
      } else if (verifyType === "EMAIL_VERIFICATION") {
        setEmailVerified(false);
 
        setEmailMsg("아직 인증이 완료되지 않았습니다. 메일함의 인증 버튼을 눌러주세요.");
        setEmailMsgColor("#FF0000");
      } else {
        setEmailVerified(false);
        setEmailMsg("회원가입 인증 상태가 아닙니다. 다시 시도해 주세요.");
        setEmailMsgColor("#FF0000");
      }
    } catch (err) {
      if (err?.response?.status === 404) {
        setEmailVerified(false);
        setEmailMsg("인증 내역이 없습니다. ‘중복 확인’으로 인증 메일을 다시 받아주세요.");
        setEmailMsgColor("#FF0000");
      } else {
        console.error("인증 확인 오류:", err);
        setEmailMsg("인증 상태 조회 중 오류가 발생했습니다.");
        setEmailMsgColor("#FF0000");
      }
    } finally {
      setEmailLoading(false);
    }
  };


  useEffect(() => {
    setEmailInitSent(false);
    setEmailVerified(false);
  }, [email]);

  const SignUpHandler = async (e) => {
    e.preventDefault();
    if (password !== checkpassword) return;

    try {
      await signUpApi({ email, nickname, password });
      alert("회원가입이 완료되었습니다");
      navigate("/signin");
    } catch (err) {
      alert(`회원가입 실패: ${err.message}`);
      console.error("회원가입 에러:", err);
    }
  };

  const isPwValid = password.length >= 6 && password.length <= 15;

  return (
    <div className="text-white">
      <button className="text-[55px] ml-[25px] mt-[18px]" type="button"
      onClick={() => navigate(-1)}>
        <GoArrowLeft />
      </button>

      <div className="flex flex-col items-center">
        <span className="mt-[77px] text-[23px]">작은 별, 작은 감정의 조각</span>
        <span className="text-[90px] font-julius mt-[2px]">STARLET</span>

        <form className="flex flex-col gap-[12px] text-[20px]" onSubmit={SignUpHandler}>
       
          <div className="flex flex-col gap-[6px]">
            <div className="flex flex-row gap-[12px] items-center">
              <input
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (!emailVerified) setEmailMsg("");
                }}
                placeholder="이메일 주소"
                className="w-[431px] h-[66px] border rounded-[5px] px-5"
                disabled={emailVerified}
              />
              <button
                className="border rounded-[5px] w-[111px] h-[66px] text-[20px] hover:bg-[#3E33DB] hover:text-white disabled:opacity-60"
                onClick={handleEmailCheck}
                type="button"
                disabled={emailLoading || emailVerified}
              >
                {emailLoading ? "발송중..." : "중복 확인"}
              </button>
            </div>

     
            {!emailVerified && emailInitSent && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleEmailConfirm}
                  className="mt-[2px] w-[554px] h-[44px] border rounded-[5px] hover:bg-[#3E33DB] text-[20px]"
                  disabled={emailLoading}
                >
                  인증 완료
                </button>
              </div>
            )}

            <div className="h-[18px] leading-[18px] text-[13px]" style={{ color: emailMsgColor }}>
              {emailMsg || "\u00A0"}
            </div>
          </div>


          <div className="flex flex-col gap-[6px]">
            <div className="flex flex-row gap-[12px] items-center">
              <input
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  setNicknameMsg("");
                }}
                placeholder="닉네임"
                className="w-[431px] h-[66px] border rounded-[5px] px-5"
              />
              <button
                className="border rounded-[5px] hover:bg-[#3E33DB] hover:text-white w-[111px] h-[66px] text-[20px]"
                onClick={handleNicknameCheck}
                type="button"
              >
                중복 확인
              </button>
            </div>
            <div className="h-[18px] leading-[18px] text-[13px]">
              {nicknameMsg ? (
                <span className={nicknameMsg.includes("사용 가능") ? "text-[#54C65B]" : "text-[#FF0000]"}>{nicknameMsg}</span>
              ) : (
                "\u00A0"
              )}
            </div>
          </div>

          <div className="flex flex-col gap-[6px]">
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => e.target.value.length <= 15 && setPassword(e.target.value)}
              className="w-[554px] h-[66px] border rounded-[5px] p-5"
            />
            <div className="h-[18px] leading-[18px] text-[13px]">
              {password ? (
                <span className={isPwValid ? "text-[#54C65B]" : "text-[#FF0000]"}>
                  {isPwValid ? "사용 가능한 비밀번호입니다." : "비밀번호는 6~15글자 이내여야합니다."}
                </span>
              ) : (
                "\u00A0"
              )}
            </div>
          </div>

          {/* 비밀번호 확인 */}
          <input
            type="password"
            placeholder="비밀번호 확인"
            value={checkpassword}
            onChange={(e) => setCheckpassword(e.target.value)}
            className="w-[554px] h-[66px] border rounded-[5px] px-5"
          />
          <div className="h-[18px] leading-[18px] text-[13px]">
            {password && checkpassword && password !== checkpassword && (
              <span className="text-[13px] text-[#FF0000]">비밀번호가 일치하지 않습니다.</span>
            )}
            {password && checkpassword && password === checkpassword && (
              <span className="text-[13px] text-[#54C65B]">비밀번호가 일치합니다.</span>
            )}
          </div>

          <button
            type="submit"
            className="w-[554px] h-[66px] text-[24px] bg-[#3E33DB] hover:bg-[#2519cc]"
            disabled={!emailVerified} 
          >
            SIGNUP
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
