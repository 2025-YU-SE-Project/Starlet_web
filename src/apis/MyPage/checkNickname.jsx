import api from "../api";

async function checkNickname(newNickname) {
  try {
    const res = await api.get("mypage/available", {
      params: { newNickname },
    });

    if (res.status === 200) {
      return { available: true };
    }

    return { available: false };
  } catch (error) {
    const status = error.response?.status;

    if (status === 409) {
      return { available: false };
    }

    const message =
      error.response?.data?.message ||
      "닉네임 중복 확인 중 오류가 발생했습니다.";

    const err = new Error(message);
    err.status = status;
    throw err;
  }
}

export default checkNickname;
