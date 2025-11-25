import axios from "axios";

export const getAccessToken = () =>
  localStorage.getItem("accessToken") ||
  sessionStorage.getItem("accessToken") ||
  null;

const api = axios.create({
  baseURL: "http://13.209.42.66:8080/api/v1/",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function handleLogoutAndRedirect() {
  try {
    localStorage.removeItem("accessToken");
    sessionStorage.removeItem("accessToken");
  } catch (e) {
    console.warn("토큰 삭제 실패:", e);
  }
  window.location.href = "/signin";
}

api.interceptors.response.use(
  (response) => {
    if (response?.data?.status === 401) {
      alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
      handleLogoutAndRedirect();
      return Promise.reject(new Error("Unauthorized(body)"));
    }
    return response;
  },
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
      handleLogoutAndRedirect();
    }

    return Promise.reject(error);
  }
);

export default api;
