import api from "../api.jsx";

export default async function createConstellation(payload) {
  console.log("[createConstellation] payload:", payload);
  const { data } = await api.post("constellation", payload);
  return data;
}
