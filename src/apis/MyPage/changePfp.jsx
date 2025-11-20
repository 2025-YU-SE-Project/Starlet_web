import api from "../api";

const changePfp = async (imageUrl) => {
  try {
    const response = await api.post("mypage/photo/confirm", {
      url: imageUrl,
    });

    return response.data;
  } catch (err) {
    const serverMessage = err.response?.data?.message;

    if (serverMessage) {
      throw new Error(serverMessage);
    }

    if (err.response) {
      throw new Error("프로필 사진 변경에 실패했습니다.");
    }

    throw new Error("서버에 연결할 수 없습니다.");
  }
};

export default changePfp;
