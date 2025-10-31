import api from "../api.jsx";

export default async function updateConstellation(id, payload) {
  console.log("[updateConstellation] id, payload:", id, payload);
  const { data } = await api.patch(`constellation/${id}`, payload);
  return data;
}
