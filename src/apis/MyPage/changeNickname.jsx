import api from "../api";

const changeNickname = async (newNickname) => {
  try {
    const response = await api.patch("mypage/nickname", {
      nickname: newNickname,
    });
    return response.data;
  } catch (err) {
    const serverMessage = err.response?.data?.message;

    if (serverMessage) {
      throw new Error(serverMessage);
    }

    if (err.response) {
      throw new Error("닉네임 변경에 실패했습니다.");
    }

    throw new Error("서버에 연결할 수 없습니다.");
  }
};

export default changeNickname;
