
import api from "./api";

export default async function getConstellationArchive(id) {

  const res = await api.get(`/constellation/archive/${id}`);
  return res.data;
}
