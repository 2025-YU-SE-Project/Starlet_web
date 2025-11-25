import api from "../api";

export async function acceptFriendRequest(friendId) {
  const res = await api.post("friends/accept", {
    friendId,
  });
  return res.data;
}
