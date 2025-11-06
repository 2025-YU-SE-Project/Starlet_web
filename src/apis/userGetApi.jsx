import authApi from "./authApi";

const userGetApi = async (accessToken) => {
  const api = authApi(accessToken);
  const res = await api.get("user/get");
  return res.data; 
};

export default userGetApi;
