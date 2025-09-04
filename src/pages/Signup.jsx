import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { GoArrowLeft } from "react-icons/go";

const Signup = () => {

    const [email, setEmail] = useState("")
    const[nickname, setNickname] = useState("")
    const[password, setPassword] = useState("")


    const SignUpHandler = async(e) => {
        e.preventDefault()

        const body = { //양식 내려오기전
              email: email,
              nickname: nickname,
              password: password,
        }
        try{
            await signUpApi(body)
            Navigate("/") // 성공시 일단 홈으로 이동하게
        } catch(err){
            alert(`회원가입 실패: ${err.message}`)
            console.error("회원가입 에러:", err)
        }

    }    



  return (
    <>
    <div className='text-white'>
        <button className='text-[55px] ml-[25px] mt-[18px]'>
            <GoArrowLeft />
        </button>
        <div className="flex flex-col items-center">
            <span className="mt-[77px] text-[23px]">작은 별, 작은 감정의 조각</span>
            <span className="text-[90px] font-julius mt-[2px]">STARLET</span>
         
            <form className='flex flex-col gap-[24px]' onSubmit={SignUpHandler}>
                <input
                value={email}
                onChange = {(e) => setEmail(e.target.value)}
                placeholder="이메일 주소"
                className="w-[554px] h-[66px] border rounded-[5px] px-5" /*피그마에 패딩 설정X -> 임의로 설정*/
                />
                <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="닉네임"
                className="w-[554px] h-[66px] border rounded-[5px] px-5"
                />
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-[554px] h-[66px] border rounded-[5px] px-5"
            />
            <input
                type="password"
                placeholder="비밀번호 확인"
                value={checkpassword}
                onChange={(e) => validPassword(e.target.value)}
                className="w-[554px] h-[66px] border rounded-[5px] px-5"
            />
            <button type="submit" className="w-[554px] h-[66px] text-[24px] bg-[#3E33DB] ">
              가입하기
            </button>

            </form>
          
        </div>
    </div>
    </>
  )
}

export default Signup