import api from "../api";

export async function searchFriend(searchNickname, signal) {
  const res = await api.get("friends/search", {
    params: { searchNickname },
    signal,
  });
  return res.data;
}
