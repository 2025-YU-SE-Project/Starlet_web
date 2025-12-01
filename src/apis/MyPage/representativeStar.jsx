import api from "../api";

const representativeStar = async () => {
  try {
    const response = await api.get("mypage/representative");

    if (response.status === 204) {
      return null;
    }

    return response.data;
  } catch (error) {
    const status = error?.response?.status;
    const message = error?.response?.data?.message;

    if (status === 401 || status === 404) {
      throw {
        status,
        message: message || "대표 별자리를 조회할 수 없습니다.",
      };
    }

    throw {
      status: status || 500,
      message: "서버 오류가 발생했습니다.",
    };
  }
};

export default representativeStar;
