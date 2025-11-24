// src/apis/MyPage/changeNickname.jsx
import api from "../api";

/**
 * 닉네임 변경 API
 * PATCH /api/v1/mypage/nickname
 *
 * @param {string} nickname - 변경할 닉네임
 * @returns {Promise<{ nickname: string }>}
 *
 * 성공 시: { nickname: "new_nickname" }
 * 실패 시: axios 에러 throw (400, 404, 409)
 */
const changeNickname = async (nickname) => {
  try {
    const response = await api.patch("mypage/nickname", {
      nickname,
    });

    // 성공 (200): { nickname: "new_nickname" }
    return response.data;
  } catch (error) {
    // 서버에서 보낸 상태코드
    const status = error?.response?.status;
    const message = error?.response?.data?.message;

    // 명세된 에러(400,404,409)는 그대로 throw
    if (status === 400 || status === 404 || status === 409) {
      throw {
        status,
        message: message || "닉네임 변경 오류가 발생했습니다.",
      };
    }

    // 기타 서버 및 네트워크 오류
    throw {
      status: status || 500,
      message: "서버 통신 중 오류가 발생했습니다.",
    };
  }
};

export default changeNickname;
