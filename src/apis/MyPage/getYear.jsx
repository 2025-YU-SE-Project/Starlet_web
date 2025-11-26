import api from "../api";

async function getYear(year) {
  try {
    const res = await api.get(`mypage/year?year=${year}`);
    return res.data;
  } catch (error) {
    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      "별자리 통계를 불러오는 중 오류가 발생했습니다.";

    const err = new Error(message);
    err.status = status;
    throw err;
  }
}

export default getYear;
