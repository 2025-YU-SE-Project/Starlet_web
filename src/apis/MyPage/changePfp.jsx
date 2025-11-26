import api from "../api";

async function changePfp(tempKey) {
  const key = (tempKey || "").trim();

  if (!key) {
    const err = new Error("tempKey는 필수입니다.");
    err.status = 400;
    throw err;
  }

  try {
    const res = await api.post("mypage/photo/confirm", {
      tempKey: key,
    });

    return res.data;
  } catch (error) {
    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      "프로필 이미지를 변경하는 중 오류가 발생했습니다.";

    const err = new Error(message);
    err.status = status;
    throw err;
  }
}

export default changePfp;
