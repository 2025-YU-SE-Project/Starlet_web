import api from "./api";

const applyNewPasswordByEmail = async ({ email, newPassword }) => {
  const res = await api.post(
    "/verify/password-reset/new-password",
    { email, newPassword },
    { headers: { "Content-Type": "application/json", Accept: "*/*" } }
  );
  return res.data;
};

export default applyNewPasswordByEmail;
