import api from "../api";

export default function repositionConstellation(id, body) {
  return api.patch(`/constellation/reposition/${id}`, body);
}
