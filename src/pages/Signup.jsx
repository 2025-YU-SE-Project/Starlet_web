import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { GoArrowLeft } from "react-icons/go";
import signUpApi from "../apis/signUpApi";
import emailCheckApi from "../apis/emailCheckApi";
import nicknameCheckApi from "../apis/nicknameCheckApi";
import emailInitApi from "../apis/emailInitApi";

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

  const [nicknameMsg, setNicknameMsg] = useState("");

  useEffect(() => {
    if (verifiedFlag === "done") {
      setEmailMsg("이메일 인증이 완료되었습니다.");
      setEmailMsgColor("#54C65B");
    }
  }, [verifiedFlag]);

  const handleNicknameCheck = async () => {
    const v = nickname.trim();
    if (!v) {
      setNicknameMsg("닉네임을 입력해주세요.");
      return;
    }
    try {
      const result = await nicknameCheckApi(v);
      if (result?.available === true) {
        setNicknameMsg("사용 가능한 닉네임입니다.");
      } else if (result?.available === false) {
        setNicknameMsg("중복된 닉네임입니다.");
      } else {
        setNicknameMsg("서버 응답 형식이 예상과 달라요.");
      }
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
    // 간단 형식 검증
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      setEmailMsg("이메일 형식이 올바르지 않습니다.");
      setEmailMsgColor("#FF0000");
      return;
    }

    try {
      setEmailLoading(true);

      // 중복 검사
      const result = await emailCheckApi(v);

      if (result?.available) {
        // 중복 → 인증 메일 발송
        await emailInitApi(v);
        setEmailMsg("사용 가능한 이메일입니다. 메일함에서 인증 링크를 확인해주세요.");
        setEmailMsgColor("#54C65B");
      } else {
        // 중복 → 발송 X
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

  const SignUpHandler = async (e) => {
    e.preventDefault();

    if (password !== checkpassword) return;

    try {
      await signUpApi({ email, nickname, password });
      alert("회원가입이 완료되었습니다");
      navigate("/");
    } catch (err) {
      alert(`회원가입 실패: ${err.message}`);
      console.error("회원가입 에러:", err);
    }
  };

  const isPwValid = password.length >= 6 && password.length <= 15;

  return (
    <>
      <div className="text-white">
        <button className="text-[55px] ml-[25px] mt-[18px]" type="button">
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
                    if (verifiedFlag !== "done") setEmailMsg("");
                  }}
                  placeholder="이메일 주소"
                  className="w-[431px] h-[66px] border rounded-[5px] px-5"
                />
                <button
                  className="border rounded-[5px] w-[111px] h-[66px] text-[20px]"
                  onClick={handleEmailCheck}
                  type="button"
                  disabled={emailLoading}
                >
                  {emailLoading ? "발송중..." : "중복 확인"}
                </button>
              </div>
        
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
                  className="border rounded-[5px] w-[111px] h-[66px] text-[20px]"
                  onClick={handleNicknameCheck}
                  type="button"
                >
                  중복 확인
                </button>
              </div>
              <div className="h-[18px] leading-[18px] text-[13px]">
                {nicknameMsg ? (
                  <span className={nicknameMsg.includes("사용 가능") ? "text-[#54C65B]" : "text-[#FF0000]"}>
                    {nicknameMsg}
                  </span>
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
                onChange={(e) => setPassword(e.target.value)}
                className="w-[554px] h-[66px] border rounded-[5px] px-5"
              />
  
              <div className="h-[18px] leading-[18px] text-[13px]">
                {password
                  ? (
                    <span className={isPwValid ? "text-[#54C65B]" : "text-[#FF0000]"}>
                      {isPwValid
                        ? "사용 가능한 비밀번호입니다."
                        : "비밀번호는 6~15글자 이내여야합니다."}
                    </span>
                  )
                  : "\u00A0"}
              </div>
            </div>

 
            <input
              type="password"
              placeholder="비밀번호 확인"
              value={checkpassword}
              onChange={(e) => setCheckpassword(e.target.value)}
              className="w-[554px] h-[66px] border rounded-[5px] px-5"
            />

            {password && checkpassword && password !== checkpassword && (
              <span className="text-[13px] text-[#FF0000]">비밀번호가 일치하지 않습니다.</span>
            )}
            {password && checkpassword && password === checkpassword && (
              <span className="text-[13px] text-[#54C65B]">비밀번호가 일치합니다.</span>
            )}

            <button type="submit" className="w-[554px] h-[66px] text-[24px] bg-[#3E33DB] ">
              가입하기
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Signup;
