import api from "../api";

export async function rejectFriendRequest(friendId, signal) {
  const res = await api.delete("friends/reject", {
    data: { friendId },
    signal,
  });
  return res.data;
}
