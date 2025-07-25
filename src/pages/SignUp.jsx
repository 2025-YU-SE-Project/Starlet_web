import React, { useState } from "react";
import backgroundImage from "../assets/background.png";

const SignUp = () => {
  const [password, setPassword] = useState("");
  const [checkPassword, setCheckPassword] = useState("");
  const [errorPassword, setErrorPassword] = useState("");

  const validPassword = (value) => {
    setCheckPassword(value);

    if (password && value) {
      if (password === value) {
        setErrorPassword("collect");
      } else {
        setErrorPassword("notCollect");
      }
    } else {
      setErrorPassword("");
    }
  };

  return (
    <div
      className="w-full h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div>
        <button className="text-white text-5xl px-3 py-2 transition hover:scale-95">
          ←
        </button>
        <div className="pt-16 text-center">
          <h1 className="text-white text-2xl mb-2">
            작은 별, 작은 감정의 조각
          </h1>
          <h1
            className="text-white text-8xl"
            style={{ fontFamily: "'Julius Sans One', sans-serif" }}
          >
            STARLET
          </h1>

          <div className="max-w-md mx-auto flex flex-col gap-6 mt-16">
            <input
              type="email"
              placeholder="이메일 주소"
              className="bg-black/20 border border-white text-white placeholder-white p-3 rounded"
            />
            <input
              type="text"
              placeholder="닉네임"
              className="bg-black/20 border border-white text-white placeholder-white p-3 rounded"
            />
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-black/20 border border-white text-white placeholder-white p-3 rounded"
            />

            <div className="relative">
              <input
                type="password"
                placeholder="비밀번호 확인"
                value={checkPassword}
                onChange={(e) => validPassword(e.target.value)} // 여기 핵심!
                className="bg-black/20 border border-white text-white placeholder-white p-3 rounded w-full"
              />
              {errorPassword === "notCollect" && (
                <p className="absolute text-sm right-2 top-full mt-1 text-red-500">
                  비밀번호가 일치하지 않습니다.
                </p>
              )}
              {errorPassword === "collect" && (
                <p className="absolute text-sm right-2 top-full mt-1 text-green-400">
                  비밀번호가 일치합니다.
                </p>
              )}
            </div>

            <button className="p-3 mt-4 bg-[#3E33DB] rounded text-white transition hover:scale-95">
              가입하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
