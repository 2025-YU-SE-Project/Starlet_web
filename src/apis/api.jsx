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

export default api;
