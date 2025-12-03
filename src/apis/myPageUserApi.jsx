import authApi from "./authApi";

const myPageUserApi = async (accessToken) => {
  const api = authApi(accessToken);
  const res = await api.get("mypage/user");
  return res.data;
};

export default myPageUserApi;
