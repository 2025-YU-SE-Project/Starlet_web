import api from "../api.jsx";

export default async function repositionConstellation(id, payload) {
  const { data } = await api.patch(`constellation/reposition/${id}`, payload);
  return data;
}
