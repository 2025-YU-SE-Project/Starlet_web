import React from 'react'
import stargroup1 from "./../assets/home/starGroup1.png";
import stargroup2 from "./../assets/home/starGroup2.png";
import img1 from "./../assets/home/img1.png";
import img2 from "./../assets/home/img2.png"
import img3 from "./../assets/home/img3.png"
import img4 from "./../assets/home/img4.png"
import { useTranslation } from "react-i18next";

const HomeBottom = () => {

  const { t, i18n } = useTranslation();
  return (
    <div className='flex flex-col bg-[#F7F7F7] mt-[40px]'>

      <div className='flex flex-row font-pretendard text-[32px] font-extrabold justify-center mt-10'>
        <span className='text-[#334D9D] pr-2'>1</span>
        <span className='text-[#4F4F4F]/70 pr-2'>Day</span>
        <span className='text-[#334D9D] pr-2'>1</span>
        <span className='text-[#4F4F4F]/70'>Diary</span>
      </div>

      <span className='text-[24px] font-semibold text-[#4F4F4F]/70 text-center'>{t("subtext.1")}</span>

      <div className='flex flex-row gap-11 items-center justify-center mt-11'>
        <div className='bg-[#F23B00] w-[70px] h-[70px] borde rounded-full'></div>
        <div className='bg-[#FEA004] w-[70px] h-[70px] borde rounded-full'></div>
        <div className='bg-[#FEE444] w-[70px] h-[70px] borde rounded-full'></div>
        <div className='bg-[#9AFF93] w-[70px] h-[70px] borde rounded-full'></div>
        <div className='bg-[#5DDCFF] w-[70px] h-[70px] borde rounded-full'></div>
        <div className='bg-[#C69FFF] w-[70px] h-[70px] borde rounded-full'></div>
      </div>

       
       <span className='font-semibold text-[#4F4F4F]/70 text-[24px] text-center mt-13'>{t("subtext.2")}</span>
      

      <div className='flex flex-row justify-center gap-15 mt-10'>
          <img src={stargroup1}/>
          <img src={stargroup2}/>
      </div>   

    <div className='w-full h-[1px] bg-[#828282] my-12'></div>

      <div className='flex flex-row'>
          <div className='flex flex-col'>
                <div className='text-[#335D9D] font-bold text-[26px] ml-24 flex flex-col '><span>{t("subtext.3")}</span><span>{t("subtext.4")}</span></div>
                 <img className='w-40 h-40 ml-48 mt-10' src={img1}/>
          </div>
            <img className="ml-auto" src={img2}/>
      </div>

  
        <div className="flex flex-row justify-between mt-22 ml-25 items-start">
      <div className="relative font-pretendard w-[550px] bg-[#F7F7F7] border-[3px] border-[#C8C8C8] rounded-[30px] pt-14 pb-10 px-6">

        {/* 제목 */}
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#F7F7F7] px-4">
          <span className="text-[22px] font-extrabold text-[#334D9D] whitespace-nowrap">
            {t("subtext.5")}
          </span>
        </div>

        {/* 첫 번째 기능 */}
        <div className="flex flex-col items-center ">
          <div className="px-6 py-3 rounded-full bg-[#D9D9D9] text-[20px] font-semibold text-[#4F4F4F]/70">
            {t("subtext.6")}
          </div>

          <span className="text-center text-[#4F4F4F]/70 mt-4 leading-relaxed text-[20px] mb-10 flex flex-col ">
            <div><span className='font-bold'>{t("subtext.7")}</span>{t("subtext.8")}</div>
          {t("subtext.9")}
          </span>
        </div>



        {/* 두 번째 기능 */}
        <div className="flex flex-col items-center">
          <div className="px-6 py-3 rounded-full bg-[#D9D9D9] text-[20px] font-semibold text-[#4F4F4F]/70">
            {t("subtext.10")}
          </div>

          <div className="flex flex-col text-center text-[#4F4F4F]/70 mt-4 leading-relaxed text-[20px]">
          <div>
            <span className='font-bold'>{t("subtext.11")} </span> 
            {t("subtext.12")}</div>
            {t("subtext.13")}
          </div>
        </div>
      </div>
          {/* 이미지 첨부 */}
          <img className="ml-auto" src={img3}/>
    </div>
    
   <div className='flex flex-col'>
  <span className='text-[26px] ml-24 font-bold font-pretendard text-[#335D9D]'>
   {t("subtext.14")}
  </span>

  <div className='flex flex-row font-pretendard gap-10 justify-center items-center mt-10 mb-25'>
    <span className='text-[#9C9C9C]/70 text-[20px] border rounded-full border-[#D9D9D9] flex flex-col justify-center items-center w-31 h-31 text-center'>
      <span className='text-[#4F4F4F]/70 font-bold'>
        별빛
      </span>
      <span className='text-[#4F4F4F]/70'>
        탐험가
      </span>
    </span>
     <span className='text-[#9C9C9C]/70 text-[20px] border rounded-full border-[#D9D9D9] flex flex-col justify-center items-center w-31 h-31 text-center'>
      <span className='text-[#4F4F4F]/70 font-bold'>
        별무리
      </span>
      <span className='text-[#4F4F4F]/70'>
        탐험가
      </span>
    </span>
     <span className='text-[#9C9C9C]/70 text-[20px] border rounded-full border-[#D9D9D9] flex flex-col justify-center items-center w-31 h-31 text-center'>
      <span className='text-[#4F4F4F]/70 font-bold'>
        별자리
      </span>
      <span className='text-[#4F4F4F]/70'>
        탐험가
      </span>
    </span>
     <span className='text-[#9C9C9C]/70 text-[20px] border rounded-full border-[#D9D9D9] flex flex-col justify-center items-center w-31 h-31 text-center'>
      <span className='text-[#4F4F4F]/70 font-bold'>
        성운
      </span>
      <span className='text-[#4F4F4F]/70'>
        탐험가
      </span>
    </span>
     <span className='text-[#9C9C9C]/70 text-[20px] border rounded-full border-[#D9D9D9] flex flex-col justify-center items-center w-31 h-31 text-center'>
      <span className='text-[#4F4F4F]/70 font-bold'>
        은하
      </span>
      <span className='text-[#4F4F4F]/70'>
        탐험가
      </span>
    </span>
     <span className='text-[#9C9C9C]/70 text-[20px] border rounded-full border-[#D9D9D9] flex flex-col justify-center items-center w-31 h-31 text-center'>
      <span className='text-[#4F4F4F]/70 font-bold'>
        은하단
      </span>
      <span className='text-[#4F4F4F]/70'>
        탐험가
      </span>
    </span>
     <span className='text-[#9C9C9C]/70 text-[20px] border rounded-full border-[#D9D9D9] flex flex-col justify-center items-center w-31 h-31 text-center'>
      <span className='text-[#4F4F4F]/70 font-bold'>
        은하수
      </span>
      <span className='text-[#4F4F4F]/70'>
        탐험가
      </span>
    </span>
     <span className='text-[#9C9C9C]/70 text-[20px] border rounded-full border-[#D9D9D9] flex flex-col justify-center items-center w-31 h-31 text-center'>
      <span className='text-[#4F4F4F]/70 font-bold'>
        우주
      </span>
      <span className='text-[#4F4F4F]/70'>
        탐험가
      </span>
    </span>
  </div>
</div>

    <div className='flex flex-col font-pretendard bg-[#9D9D9D] pl-22 pb-15  text-[#E1E1E1]'>
        <div className='flex flex-row gap-4 items-center pt-15'>
            <img src={img4} />
            <span className='font-semibold text-[45px]'>STARLET</span>
        </div>

        <div className='font-semibold text-[15px]'>
        <span className='mt-5 block'>STARLET | 경상북도 경산시 대학로 280 (대동)</span>
        <span className='mt-5 block'>영남대학교 소프트웨어 공학 프로젝트 | frontend 조민서 임태현 조은별 backend 최정 이나현</span>
        <span className='mt-5 block'>
          본 서비스는 사용자의 감정 기반 일기 생성과 별자리 시각화를 제공하는 웹 애플리케이션으로, 2025년 3학년 2학기 영남대학교 소프트웨어공학 프로젝트로 기획 개발되었습니다.
          <br/>
          하루의 감정을 별로 남기고, 작성한 별을 활용하여 별자리로 기록해 나만의 밤하늘을 완성하는 서비스입니다.
        </span>
        </div>
    </div>
</div>

      

  )
}

export default HomeBottom

