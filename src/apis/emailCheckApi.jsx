import api from "./api";


const emailCheckApi = async (email) => {
  const res = await api.get("email/check-duplication", {
    params: { address: email },             
    validateStatus: (s) => s === 200 || s === 409, 
    headers: { Accept: "*/*" },
  });

  if (res.status === 200) return { available: true };

  return {
    available: false,
    message: res.data?.message || "이메일이 중복됩니다.",
  };
};

export default emailCheckApi;
