import api from "../api";

const getDiarySummary = async (year, month) => {
  try {
    const response = await api.get("calendar/diary/summary", {
      params: { year, month },
    });

    return response.data;
  } catch (err) {
    if (err.response?.data?.message) {
      throw new Error(err.response.data.message);
    }
    if (err.response?.data?.error) {
      throw new Error(err.response.data.error);
    }
    if (typeof err.response?.data === "string") {
      throw new Error(err.response.data);
    }

    if (err.response) {
      throw new Error(`오류 발생 (status: ${err.response.status})`);
    }
    if (err.request) {
      throw new Error("서버 응답이 없습니다.");
    }

    throw new Error("요청 중 알 수 없는 오류가 발생했습니다.");
  }
};

export default getDiarySummary;
