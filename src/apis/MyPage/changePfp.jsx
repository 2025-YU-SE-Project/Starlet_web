import api from "../api";

const changePfp = async (tempKey) => {
  try {
    const res = await api.post("mypage/photo/confirm", {
      tempKey,
    });

    return res.data;
  } catch (error) {
    console.error("에러:", error);
    const msg = error.response?.data?.message || "오류가 발생했습니다.";
    throw new Error(msg);
  }
};

export default changePfp;
