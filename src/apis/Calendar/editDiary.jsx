import api from "../api";

/** 감정 일기 수정 */
const updateDiary = async (payload) => {
  try {
    const response = await api.patch("calendar/diary", payload);
    return response.data;
  } catch (err) {
    if (err.response?.data?.message) {
      throw new Error(err.response.data.message);
    } else if (err.response) {
      throw new Error(`오류 발생 (error ${err.response.status})`);
    } else if (err.request) {
      throw new Error("서버로부터 응답이 없습니다.");
    } else {
      throw new Error("알 수 없는 오류가 발생했습니다.");
    }
  }
};

export default updateDiary;
