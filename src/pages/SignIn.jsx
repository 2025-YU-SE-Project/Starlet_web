import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'



const SignIn = () => {
  // 파일 다만들고 js 코드는 재수정
const [usermail, setUsermail] = useState("");
  const [password, setPassword] = useState("");

  // const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  /**로그인 버튼 클릭 시 실행되는 함수 */
  const SignInHandler = async (e) => {
    e.preventDefault();

    /**Request body 양식에 맞추기 */
    const body = {
      usermail: usermail,
      password: password,
    };

    try {
      /**로그인 API 호출 */
      const result = await SignInApi(body);
      login(result.accessToken);
      alert("로그인이 완료되었습니다!");

      /**성공 시 Home으로 이동 */
      navigate("/");
    } catch (err) {
      alert(`로그인 실패: ${err.message}`);
      console.error("로그인 에러:", err);
    }
  };


  return (
    <div className='flex flex-col h-screen w-screen items-center justify-center text-white gap-5'>
    <div className='flex flex-col mb-12 gap-8'> 
        <span className='text-2xl ml-28'>작은 별, 작은 감정의 조각</span>
        <span className="text-9xl font-julius ">STARLET</span>
    </div>

      <form onSubmit={SignInHandler} className='flex flex-col gap-5 w-140'>
        <input value={usermail}
        onChange={(e) => setUsermail(e.target.value)}
        className='p-2 font text-xl border  rounded-md h-15' placeholder='이메일 주소'/>

        <input 
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className='p-2 font text-xl border  rounded-md h-15'placeholder='비밀번호' type='password'/>
        <button className='p-2 font text-2xl border border-gray-400 bg-indigo-600 rounded-md h-15' type='submit'>LOGIN</button>
      </form>

    <div className='flex gap-3'>
      <input type='checkbox'/>
      <span className='text-xl mr-95'>로그인 상태 유지</span>
    </div>

    <div className='text-xl mt-12 text-gray-500'>
      <span>계정이 없으신가요?</span>
      <Link className='hover:text-white hover:font-bold'to='/signup'> 가입하기</Link>
    </div> 

     <span className='text-xl hover:font-bold'>비밀번호 찾기</span> {/* 아이디 찾기, 비밀번호 찾기 구현할 시 link 로 변환 임시 ui */}
      <Link className='text-2xl hover:font-bold' to='/'>Home</Link>
    </div>
  )
}

export default SignIn