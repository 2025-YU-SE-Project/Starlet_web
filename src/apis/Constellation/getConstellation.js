// src/apis/Constellation/getConstellation.js
import api from "../api.jsx";

export default async function getConstellation(year, month) {
  const { data } = await api.get("constellation", {
    params: { year, month },
  });
  return data;
}
