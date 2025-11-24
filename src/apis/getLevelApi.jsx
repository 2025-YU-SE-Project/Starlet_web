import api from "./api";

export default async function getLevelApi() {
  const res = await api.get("mypage/level");  
  return res.data;
}
