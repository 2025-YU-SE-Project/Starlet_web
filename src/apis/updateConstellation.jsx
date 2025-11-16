import api from "./api";

export default async function updateConstellation(id, payload) {
  const res = await api.patch(`/constellation/${id}`, {
    name: payload.name,
    description: payload.description,
  });
  return res.data;
}
