import axios from "axios"

const api = axios.create({
    baseURL: "http://13.209.42.66:8080/api/v1/", 
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
})

export default api;