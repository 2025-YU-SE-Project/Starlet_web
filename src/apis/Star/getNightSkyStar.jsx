import api from "../api";

export default async function getNightSkyStar(year, month) {
  // month는 1,3,5,7,9,11 중 하나 (짝수는 자동으로 포함됨)
  const res = await api.get("/star", {
    params: { year, month },
  });
  return res.data; // [{ starId, userId, color, date, x, y }, ...]
}
