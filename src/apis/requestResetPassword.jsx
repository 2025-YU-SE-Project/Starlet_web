import api from "./api";

const requestResetPassword = async (email) => {
  const res = await api.post(
    "/email/password-reset/request",
    { email },           
    { headers: { "Content-Type": "application/json", Accept: "*/*" } }
  );
  return res.data;
};

export default requestResetPassword;
