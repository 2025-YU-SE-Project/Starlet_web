import api from "./api";

const emailVerificationStatusApi = async (email) => {
  const res = await api.get("email/verification-status", {
    params: { address: email },
    headers: { Accept: "*/*" },
  });

  return res.data;
};

export default emailVerificationStatusApi;
