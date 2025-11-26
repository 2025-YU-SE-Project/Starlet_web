import api from "../api";

async function changeNickname(nickname) {
  const trimmed = (nickname || "").trim();

  try {
    const res = await api.patch("mypage/nickname", {
      nickname: trimmed,
    });

    return res.data;
  } catch (error) {
    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      "닉네임을 변경하는 중 오류가 발생했습니다.";

    const err = new Error(message);
    err.status = status;
    throw err;
  }
}

export default changeNickname;
