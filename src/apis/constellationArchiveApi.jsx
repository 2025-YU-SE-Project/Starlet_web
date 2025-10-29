import api from "./api";

export async function setRepresentative(constellationId) {
  if (!constellationId) throw new Error("constellationId가 필요합니다.");
  const url = `constellation/archive/${constellationId}/representative`;
  const res = await api.post(url, {}); 
  return res?.data;
}
