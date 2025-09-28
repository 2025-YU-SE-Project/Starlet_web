import api from "./api";

const signInApi = async (body) => {
  try {
    const response = await api.post("user/login", body);
    return response.data;
  } catch (err) {
    if (err.response?.data) {
      const data = err.response.data;

  
      if (data.message) {
        throw new Error(data.message);
      }
      const messages = Object.entries(data)
        .filter(([key]) => key !== "status")
        .map(([_, value]) => value)
        .join("  ");

      throw new Error(messages);
    } else if (err.response) {
      throw new Error("요청이 올바르지 않습니다.");
    } else if (err.request) {
      throw new Error("서버로부터 응답이 없습니다.");
    } else {
      throw new Error("요청 중 알 수 없는 오류가 발생했습니다.");
    }
  }
};

export default signInApi;
