import api from "../api";

const getDiary = async (dateStr) => {
  try {
    const res = await api.get(`calendar/diary/${dateStr}`);
    const { hasDiary, diary } = res.data || {};

    return { hasDiary: !!hasDiary, diary: diary || null };
  } catch (err) {
    const status = err.response?.status;
    const serverMsg = err.response?.data?.message;

    let msg = "일기를 불러오는 중 오류가 발생했습니다.";

    if (status === 400) {
      msg = serverMsg || "date 파라미터 형식이 올바르지 않습니다.";
    } else if (status === 401) {
      msg = serverMsg || "토큰이 없거나 만료되었습니다.";
    } else if (err.response) {
      msg = serverMsg || `오류 발생 (error ${status})`;
    } else if (err.request) {
      msg = "서버로부터 응답이 없습니다.";
    }

    const error = new Error(msg);
    error.status = status;
    throw error;
  }
};

export default getDiary;
