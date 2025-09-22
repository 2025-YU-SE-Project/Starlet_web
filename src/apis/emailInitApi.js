import api from "./api";


const emailInitApi = async (email) => {
  try {
    const res = await api.post(
      "email/init",
      { email },
      { headers: { "Content-Type": "application/json", Accept: "*/*" } }
    );
    return res.data;
  } catch (err) {

    if (err.response) {
      console.error(
        "[emailInitApi] server",
        err.response.status,
        err.response.data
      );
    } else {
      console.error("[emailInitApi] client", err.message);
    }
    throw err;
  }
};

export default emailInitApi;
