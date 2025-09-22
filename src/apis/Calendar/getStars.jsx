import api from "../api";

const getStars = async (year, month) => {
  try {
    if (!Number.isInteger(year) || !Number.isInteger(month)) {
      throw new Error("year, month는 정수여야 합니다.");
    }

    const res = await api.get("calendar/star", {
      params: { year, month },
    });
    return res.data;
  } catch (err) {
    const status = err.response?.status;
    const serverMsg = err.response?.data?.message;

    if (status === 400) {
      throw new Error(serverMsg || "요청 파라미터가 올바르지 않습니다.");
    }
    if (status === 401) {
      throw new Error(serverMsg || "토큰이 없거나 만료되었습니다.");
    }
    if (err.response) {
      throw new Error(serverMsg || `오류 발생 (status: ${status})`);
    }
    if (err.request) {
      throw new Error("서버로부터 응답이 없습니다.");
    }
    throw new Error("요청 중 알 수 없는 오류가 발생했습니다.");
  }
};

export default getStars;
