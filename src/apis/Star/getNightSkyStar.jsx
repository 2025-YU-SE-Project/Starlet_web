import api from "../api.jsx";

export default async function getNightSkyStar(year, month) {
  const { data } = await api.get("star", {
    params: { year, month },
  });
  return data;
}
