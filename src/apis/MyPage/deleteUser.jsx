import api from "../api";

const deleteUser = async () => {
  try {
    const res = await api.delete("user/me");
    return res.data;
  } catch (error) {
    console.error("회원 탈퇴 에러:", error);
    const msg =
      error.response?.data?.message || "회원 탈퇴 중 오류가 발생했습니다.";
    throw new Error(msg);
  }
};

export default deleteUser;
