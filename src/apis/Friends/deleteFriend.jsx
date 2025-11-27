import api from "../api";

export async function deleteFriend(friendId, signal) {
  if (!friendId) throw new Error("friendId is required");

  const res = await api.delete(`friends/${friendId}`, {
    signal,
  });

  return res.data;
}
