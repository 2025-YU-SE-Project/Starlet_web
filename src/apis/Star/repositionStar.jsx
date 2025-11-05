import api from "../api";

export default async function repositionStar(id, { x, y }) {
  const starId = Number.isFinite(+id) ? +id : id;
  const res = await api.patch(`/star/reposition/${starId}`, {
    starId,
    x,
    y,
  });
  return res.data;
}
