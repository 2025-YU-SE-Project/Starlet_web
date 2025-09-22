import authApi from "./authApi";

const logoutApi = async (accessToken) => {
  const api = authApi(accessToken);             
  const res = await api.post("user/logout");     
  return res.data;
};

export default logoutApi;
