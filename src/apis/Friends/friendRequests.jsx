import api from "../api";

export async function fetchFriendRequests(signal) {
  const res = await api.get("friends/requests", {
    signal,
  });
  return res.data;
}
