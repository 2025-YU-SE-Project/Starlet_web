import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CiMenuBurger } from "react-icons/ci";
import starImg from "../assets/starImg.png"
import diaryImg from "../assets/diaryImg.png"
import archiveImg from "../assets/archiveImg.png"
import { useTranslation } from "react-i18next";
import Sidebar from '../components/Sidebar';
import AuthContext from "../contexts/AuthContext";


const MainPage = () => {
   const { t, i18n } = useTranslation();
   const [isOpen, setIsOpen] = useState(false);
   const { accessToken } = useContext(AuthContext);
   const isLoggedIn = !!accessToken;

   const navigate = useNavigate();

  const toggleLang = () => {
    const next = i18n.language.startsWith("ko") ? "en" : "ko";
    i18n.changeLanguage(next);
  };
  
  return (
    <>
    <div className='text-white'>
         <Sidebar isOpen={isOpen} setIsOpen={setIsOpen}/>
 
        {isOpen && (
          <div
            className="fixed inset-0 z-40"
            aria-hidden="true"
            onClick={() => setIsOpen(false)}
          />
        )}

      <div className='flex flex-row justify-between'>
         <button
          className='ml-[1.81rem] mt-[2.13rem]'
          onClick={() => setIsOpen(true)}
          aria-label='open sidebar'
        >
          <CiMenuBurger size={30}/>
        </button>
       {isLoggedIn ? (

    <div className='flex mt-[1.37rem] gap-[1.37rem] items-center mr-10'>
     <button onClick={toggleLang} className="text-[1.25rem]" aria-label="toggle language" title="toggle language">
       {t("lang.toggle")}
     </button>
   </div>
 ) : (
  
   <>
   <div className='flex flex-row justify-center items-center gap-[1.37rem]'> 
     <button
       onClick={toggleLang}
       className="text-[1.25rem]"
       aria-label="toggle language"
       title="toggle language"
     >
       {t("lang.toggle")}
     </button>
     <div className='flex gap-[1.37rem] items-center mr-[3.06rem]'>
       <Link to='/signin' className='text-[1.25rem]'>{t("menu.login")}</Link>
       <Link to='/signup' className='text-[1.25rem]'>{t("menu.signup")}</Link>
     </div>
     </div>
   </>
 )}  
      </div>
       <div className='flex flex-col'>
          <span className="ml-[10.19rem] mt-[7.00rem] text-[1.25rem]"> {/*피그마랑 다르게 수정(mt)*/}
         별 하나, 감정 하나
      </span>
      <span className='font-julius text-[6.00rem] ml-[9.38rem]'>{t("hero.title")}</span>
      <span className='ml-[10.31rem] text-[1.50rem]'>"기억은 흘러가지 않아요.</span>
      <span className='ml-[16.75rem] text-[1.50rem]'>오늘의 감정을 하늘에 남겨두세요."</span> {/*피그마랑 다르게 수정(글자 크기)*/}
      <div className='flex flex-row'>
        <Link
          to='/sky'
          onClick={(e) => {
            if (!isLoggedIn) {
              e.preventDefault();
              alert("로그인 후 이용해주세요!");
              navigate("/signin");
            }
          }}
        >
          <div className='border w-[20.00rem] h-[24.94rem] rounded-[35px] bg-[#808080]/50 border-[#808080]/50 mt-[4.94rem] ml-[9.38rem]'> {/*밤하늘 페이지 피그마랑 다르게 수정(mt)*/}
              <img className='flex ml-[5.25rem] mt-[1.94rem] w-[9.50rem] h-[9.50rem]' src={starImg} alt='starImg'/>
              <div className='mt-[2.63rem] text-[1.88rem] flex justify-center'>{t("card.sky.title")}</div>
              <div className='mt-[1.69rem] flex justify-center'>나만의 별자리를 만들어보세요</div>
              <div className='flex justify-center'>당신만의 하루가 별로 남겨집니다</div>  
          </div>
         </Link> 

        <Link
            to='/calendar'
            onClick={(e) => {
              if (!isLoggedIn) {
                e.preventDefault();
                alert("로그인 후 이용해주세요!");
                navigate("/signin");
              }
            }}
          >
           <div className='border w-[20.00rem] h-[24.94rem] rounded-[35px] bg-[#808080]/50 border-[#808080]/50 mt-[4.94rem] ml-[9.38rem]'> 
              <img className='flex ml-[5.25rem] mt-[1.94rem] w-[9.50rem] h-[9.50rem]' src={diaryImg} alt='diaryImg'/>
              <div className='mt-[2.63rem] text-[1.88rem] flex justify-center'>{t("card.diary.title")}</div>
              <div className='mt-[1.69rem] flex justify-center'>오늘의 감정을 기록해보세요</div>
              <div className='flex justify-center'>당신의 하루가 별로 남겨집니다</div>
          </div>
         </Link>

        <Link to='/archive'
          onClick={(e)=>{
              if(!isLoggedIn){
                e.preventDefault()
                alert("로그인 후 이용해주세요!")
                navigate("/signin")
              }
          }}>
           <div className='border w-[20.00rem] h-[24.94rem] rounded-[35px] bg-[#808080]/50 border-[#808080]/50 mt-[4.94rem] ml-[9.38rem]'> 
              <img className='flex ml-[5.25rem] mt-[1.94rem] w-[9.50rem] h-[9.50rem]' src={archiveImg} alt='archiveImg'/>
              <div className='mt-[2.63rem] text-[1.88rem] flex justify-center'>{t("card.archive.title")}</div>
              <div className='mt-[1.69rem] flex justify-center'>당신이 만든 별자리를</div>
              <div className='flex justify-center'>확인해보세요</div>
          </div>
        </Link> 
      </div>

       </div>

    </div>
    </>
  )
}

export default MainPage