import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import signInApi from '../apis/signInApi';
import AuthContext from "../contexts/AuthContext";


const SignIn = () => {

const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const[remember, setRemember] = useState(false)

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();


  const SignInHandler = async (e) => {
    e.preventDefault();


    const body = {
      email: email,
      password: password,
    };

    try {
  
      const result = await signInApi(body);
      const token = result.accessToken

      if(remember) {
        localStorage.setItem("accessToken", token);
      } else {
        sessionStorage.setItem("accessToken", token);
      }

      login(result.accessToken);
      alert("로그인이 완료되었습니다!");

   
      navigate("/");
    } catch (err) {
      alert(`로그인 실패: ${err.message}`);
      console.error("로그인 에러:", err);
    }
  };


  return (
   <>
   <div className='flex flex-col text-white items-center'>
      <span className='text-[23px] mt-[147px]'>작은 별, 작은 감정의 조각</span>
      <span className='text-[90px] font-julius mt-[2px]'>STARLET</span>
      <form onSubmit={SignInHandler} className='flex flex-col gap-[34px]'>
        <input value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder='이메일 주소'
        className='p-5 text-[20px] border rounded-[5px]'/>
        <input value={password} 
        type='password'
        onChange={(e) => setPassword(e.target.value)}
        placeholder='비밀번호'
        className='p-5 border rounded-[5px] text-[20px]'/>
        <button type='submit' className='w-[554px] h-[66px] bg-[#3E33DB] text-[24px] p-3'>LOGIN</button>
      </form>
    <div className="flex items-center mt-[10px]">
 <div className="w-[554px] flex justify-start mt-[10px]">
  <label className="flex items-center gap-[10px] cursor-pointer">
    <input
      type="checkbox"
      checked={remember}
      onChange={() => setRemember(!remember)}
      className="w-[20px] h-[20px] accent-blue-400"
    />
    <span className='text-[20px]'>로그인 상태 유지</span>

  </label>

</div>

</div>
<div className='flex flex-row mt-[75px] gap-2 text-[20px]'>
  <span className='text-[#AEAEB2]'>계정이 없으신가요?</span>
  <Link to='/signup' className='text-white'>가입하기</Link>
</div>
<Link to='/foundpassword' className='font-bold mt-[34px] text-[20px]'>비밀번호 찾기</Link>
<Link to='/' className='font-bold mt-[34px] text-[20px]'>HOME</Link>
   </div>
   </>
   
  )
}

export default SignIn;