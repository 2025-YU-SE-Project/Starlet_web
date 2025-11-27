import api from "../api";

export async function fetchFriendList(signal) {
  const res = await api.get("friends/list", {
    signal,
  });
  return res.data;
}
