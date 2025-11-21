import api from "../api";

const getLevel = async () => {
  try {
    const res = await api.get("mypage/level");
    return res.data;
  } catch (err) {
    if (err.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    if (err.response) {
      throw new Error(`오류 발생 (error ${err.response.status})`);
    }
    if (err.request) {
      throw new Error("서버 응답이 없습니다.");
    }
    throw new Error("알 수 없는 오류가 발생했습니다.");
  }
};

export default getLevel;
