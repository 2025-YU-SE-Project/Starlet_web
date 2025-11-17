import api from "./api";

const nicknameCheckApi = async (nickname) => {
  const res = await api.get("user/signup/nickname_available", {
    params: { nickname },
    validateStatus: (s) => s >= 200 && s < 500,
  });

  if (res.status === 200) {
    return {
      available: true,
      reason: "OK",
      message: "사용 가능한 닉네임입니다.",
    };
  }

  if (res.status === 409) {
    return {
      available: false,
      reason: "DUPLICATE",
      message: res.data?.message || "닉네임이 중복됩니다.",
    };
  }

  if (res.status === 400) {
    return {
      available: false,
      reason: "HARMFUL",
      message:
        res.data?.message || "닉네임에 부적절한 내용이 포함되어 있습니다.",
    };
  }
};

export default nicknameCheckApi;
