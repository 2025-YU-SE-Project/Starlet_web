import React from 'react'
import { Link } from 'react-router-dom'
import star404 from "../assets/star404.png"

const NotFound = () => {
  return (
    <div className='text-white flex flex-row items-center justify-center gap-20'>
    <div className='flex flex-col'>
    <div className='text-8xl mt-50'>404</div>
    <div className='mt-4'>페이지를 찾을 수 없습니다.</div>
    <div>죄송합니다. 존재하지 않는 페이지입니다</div>
    <Link className='border w-36 h-10 rounded-[8px] bg-[#3B70BE] hover:bg-[#181D4D] hover:border-[#181D4D] border-[#3B70BE] mt-10 flex justify-center items-center ' to='/'>홈으로 이동하기</Link>
    </div>
    <img className='w-100 h-100 mt-60' src={star404}/>
    </div>
  )
}

export default NotFound