import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CiMenuBurger } from "react-icons/ci";
import star from "./../assets/home/star.png";
import starcard1 from "./../assets/home/starcard1.png";
import { useTranslation } from "react-i18next";
import Sidebar from "../components/Sidebar";
import AuthContext from "../contexts/AuthContext";
import LanguageSelect from "../components/LanguageSelect";
import HomeBottom from "../components/HomeBottom";
import img5 from "./../assets/home/img5.png";
import img6 from "./../assets/home/img6.png";
import img7 from "./../assets/home/img7.png";
import img8 from "./../assets/home/img8.png";
const MainPage = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const { accessToken } = useContext(AuthContext);
  const isLoggedIn = !!accessToken;

  const navigate = useNavigate();

  return (
    <>
      <div className="text-white">
        <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

        {isOpen && (
          <div
            className="fixed inset-0 z-40"
            aria-hidden="true"
            onClick={() => setIsOpen(false)}
          />
        )}

        <div className="flex flex-row justify-between">
          <button
            className="ml-[1.81rem] mt-[2.13rem]"
            onClick={() => setIsOpen(true)}
            aria-label="open sidebar"
          >
            <CiMenuBurger className="cursor-pointer" size={30} />
          </button>

          <div className="flex mt-[1.37rem] gap-[1.37rem] items-center mr-10">
            <LanguageSelect />
          </div>
        </div>

   
        {isLoggedIn ? (

          <div className="flex flex-row items-center">
            <div className="flex flex-col justify-center items-center ml-100">
              <span className="font-pretendard text-[20px]">
                 {t("hero.tagline")}
              </span>
              <span className="font-julius text-[70px]">STARLET</span>
              <div className="grid grid-cols-2 gap-x-20 gap-y-16 mt-10 font-pretendard text-[15px]">
              <Link className='flex flex-col justify-center items-center gap-2' to='/starsky'>
                <img className='border-white rounded-[20px] border-[2px] px-3 py-2'src={img5}/>
                <span>NIGHT SKY</span>
              </Link>
              <Link className='flex flex-col justify-center items-center gap-2' to='/calendar'>
                <img className='border-white rounded-[20px] border-[2px] px-3 py-3' src={img6}/>
                <span>DIARY</span>
              </Link>
               <Link className='flex flex-col justify-center items-center gap-2'  to='/archive'>
                <img className='border-white rounded-[20px] border-[2px] px-3 py-2' src={img7}/>
                <span>ARCHIVE</span>
              </Link>
              <Link className='flex flex-col justify-center items-center gap-2' to='/mypage'>
                <img className='border-white rounded-[20px] border-[2px] px-3 py-3' src={img8}/>
                <span>MY PAGE</span>
              </Link>
            </div>
            </div>

           
        <div className="ml-50 flex-[1] flex justify-center relative h-[220px]">
  <img
    src={star}
    className="w-60 h-50 absolute right-[80px] top-0 pointer-events-none"
  />
</div>

  <div className="ml-auto mt-60">
    <img  className='w-80 h-60' src={starcard1} />
  </div>
          </div>
        ) : (
          // 로그인 전 화면 
          
          <div className="flex flex-row items-center">
            <div className="flex flex-col justify-center items-center ml-100">
              <span className="font-pretendard text-[20px]">
                {t("hero.tagline")}
              </span>
              <span className="font-julius text-[70px]">STARLET</span>
              <span className="font-pretendard text-[25px] mt-10">
                 {t("hero.subtitle1")}
              </span>
              <span className="font-pretendard text-[25px] whitespace-nowrap">
                {t("hero.subtitle2")}
              </span>
              <span className="font-pretendard text-[18px] text-[#FFFFFF]/60 mt-2 ">
                 {t("hero.ctaLogin")}
              </span>

              <div className="flex flex-row gap-10 font-pretendard text-[22px] mt-7">
                <Link
                  className="border border-[#FFFFFF]/70 w-35 py-2 rounded-[50px] text-center"
                  to="/signin"
                >
                  LOGIN
                </Link>
                <Link
                  className="border border-[#FFFFFF]/70 w-35 py-2  rounded-[50px] text-center"
                  to="/signup"
                >
                  REGISTER
                </Link>
              </div>
            </div>
<div className="ml-50 flex-[1] flex justify-center relative h-[220px]">
  <img
    src={star}
    className="w-60 h-50 absolute right-[80px] top-0 pointer-events-none"
  />
</div>


  <div className="ml-auto mt-60">
    <img  className='w-80 h-60' src={starcard1} />
  </div>
          </div>
        )}

        <HomeBottom />
      </div>
    </>
  );
};

export default MainPage;
