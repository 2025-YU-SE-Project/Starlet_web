import api from "../api";

const getDiary = async (dateStr) => {
  try {
    const res = await api.get(`calendar/diary/${dateStr}`);
    return res.data;
  } catch (err) {
    const status = err.response?.status;
    const serverMsg = err.response?.data?.message;

    if (status === 404) {
      return null;
    }
    if (status === 400) {
      throw new Error(serverMsg || "date 파라미터 형식이 올바르지 않습니다.");
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

export default getDiary;
