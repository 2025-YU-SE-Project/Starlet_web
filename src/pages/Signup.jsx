import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoArrowLeft } from "react-icons/go";
import signUpApi from "../apis/signUpApi";

const Signup = () => {

    const [email, setEmail] = useState("")
    const[nickname, setNickname] = useState("")
    const[password, setPassword] = useState("")
    const [checkpassword, setCheckpassword] = useState("")

    const SignUpHandler = async(e) => {

        const navigate = useNavigate(); 

        e.preventDefault()

        const body = { 
              email: email,
              nickname: nickname,
              password: password,
        }

        if(password !== checkpassword){
            return;
        }

        try{
            await signUpApi(body)
            alert("회원가입이 완료되었습니다")
            // navigate("/"); // 성공 시 홈으로 이동 -> 마이페이지 완료되면 재시도
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
         
            <form className='flex flex-col gap-[24px] text-[20px]' onSubmit={SignUpHandler}>
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
                onChange={(e) => setCheckpassword(e.target.value)}
                className="w-[554px] h-[66px] border rounded-[5px] px-5"
            />
            {password && checkpassword && password !== checkpassword && (
            <span className="text-[16px] text-[#FF0000]">비밀번호가 일치하지 않습니다.</span>)
            }
            {password && checkpassword && password === checkpassword && (
            <span className="text-[16px] text-[#54C65B]">비밀번호가 일치합니다.</span>)
            }
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