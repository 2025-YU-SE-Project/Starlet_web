import api from "./api";


const nicknameCheckApi = async (nickname) => {
  const res = await api.get("user/signup/nickname_available", {
    params: { nickname },
    validateStatus: (s) => s === 200 || s === 409, 
  });


  if (res.status === 200) {
    return { available: true, message: "" }; 
  }
  if (res.status === 409) {
    return { available: false, message: res.data?.message || "닉네임이 중복됩니다." };
  }


  throw new Error(`UnexpectedStatus:${res.status}`);
};

export default nicknameCheckApi;
