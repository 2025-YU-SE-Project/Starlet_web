import api from "../api";

export async function requestFriend(receiverNickname) {
  const res = await api.post("friends/request", {
    receiverNickname,
  });
  return res.data;
}
