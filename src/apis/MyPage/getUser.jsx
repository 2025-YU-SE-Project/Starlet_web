import api from "../api";

const getUser = async () => {
  try {
    const response = await api.get("mypage/user");
    return response.data;
  } catch (err) {
    if (err.response?.data?.message) {
      throw new Error(err.response.data.message);
    }

    if (err.response) {
      throw new Error("사용자 정보를 불러오지 못했습니다.");
    }

    if (err.request) {
      throw new Error("서버 응답이 없습니다.");
    }

    throw new Error("알 수 없는 오류가 발생했습니다.");
  }
};

export default getUser;
