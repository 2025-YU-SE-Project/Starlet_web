import api from "../api";

const changeNickname = async (nickname) => {
  try {
    const response = await api.patch("mypage/nickname", {
      nickname,
    });

    return response.data;
  } catch (error) {
    const status = error?.response?.status;
    const message = error?.response?.data?.message;

    if (status === 400 || status === 404 || status === 409) {
      throw {
        status,
        message: message || "닉네임 변경 오류가 발생했습니다.",
      };
    }

    throw {
      status: status || 500,
      message: "서버 통신 중 오류가 발생했습니다.",
    };
  }
};

export default changeNickname;
